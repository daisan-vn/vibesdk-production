import { WebSocketMessageResponses } from '../../../agents/constants';
import { BaseController } from '../baseController';
import { generateId } from '../../../utils/idGenerator';
import { AgentState } from '../../../agents/core/state';
import { BehaviorType, ProjectType, ChatMode, resolveChatMode } from '../../../agents/core/types';
import { getAgentStub, getTemplateForQuery } from '../../../agents';
import {
    AgentConnectionData,
    AgentPreviewResponse,
    CodeGenArgs,
    DeploymentDiagnostics,
    DeploymentHistoryData,
    MAX_AGENT_QUERY_LENGTH,
} from './types';
import { CloudflareAPI } from '../../../services/deployer/api/cloudflare-api';
import { DeploymentHistoryService } from '../../../database';
import { SecurityError, SecurityErrorType } from 'shared/types/errors';
import { ApiResponse, ControllerResponse } from '../types';
import { RouteContext } from '../../types/route-context';
import { AppService, ModelConfigService } from '../../../database';
import { ModelConfig, credentialsToRuntimeOverrides } from '../../../agents/inferutils/config.types';
import { RateLimitService } from '../../../services/rate-limit/rateLimits';
import { validateWebSocketOrigin } from '../../../middleware/security/websocket';
import { createLogger } from '../../../logger';
import { getPreviewDomain, buildUserWorkerUrl } from 'worker/utils/urls';
import { ImageType, uploadImage } from 'worker/utils/images';
import { ProcessedImageAttachment } from 'worker/types/image-attachment';
import { getTemplateImportantFiles } from 'worker/services/sandbox/utils';
import { hasTicketParam } from '../../../middleware/auth/ticketAuth';
import { checkUsageAndBalance, getUserGateway } from '../../../services/rate-limit/usageChecker';
import { readTokenCookie } from '../../../utils/oauthCookie';
import { UsageLimitExceededError } from 'shared/types/errors';
import { ZipExtractor } from 'worker/services/sandbox/zipExtractor';
import type { TemplateFile } from 'worker/services/sandbox/sandboxTypes';
import { normalizeImportedFiles, patchImportedFile, readImportedName } from 'worker/services/imports/lovableAdapter';
import { zipSync } from 'fflate';

/**
 * Parse a GitHub repo URL into owner/repo/(branch). Accepts the common forms:
 * https://github.com/owner/repo[.git], .../owner/repo/tree/branch, git@github.com:owner/repo.git
 */
function parseGithubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
    const match = url
        .trim()
        .match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:\/tree\/([^/\s?#]+))?(?:[/?#].*)?$/i);
    if (!match) {
        return null;
    }
    return { owner: match[1], repo: match[2], branch: match[3] };
}

/**
 * Heuristically extract client-side route paths from a project's source files so
 * the preview can offer a route navigator (like Lovable). Matches both JSX
 * (`<Route path="/x">`) and object-config (`path: "/x"`) router definitions.
 */
function extractRoutePaths(files: { filePath: string; fileContents: string }[]): string[] {
    const paths = new Set<string>(['/']);
    const sourceFile = /\.(tsx?|jsx?)$/;
    const pathDecl = /\bpath\s*[:=]\s*\{?\s*["'`]([^"'`]*)["'`]/g;
    for (const file of files) {
        if (!file.filePath || !sourceFile.test(file.filePath)) {
            continue;
        }
        const content = file.fileContents ?? '';
        if (content.startsWith('base64:') || !/Route|createBrowserRouter|useRoutes|path\s*[:=]/.test(content)) {
            continue;
        }
        let match: RegExpExecArray | null;
        while ((match = pathDecl.exec(content)) !== null) {
            const raw = match[1].trim();
            if (!raw || raw.length > 120) {
                continue;
            }
            if (raw === '*') {
                continue; // catch-all, not a navigable route
            }
            // Only keep absolute routes — relative nested segments can't be resolved reliably.
            if (raw.startsWith('/')) {
                paths.add(raw);
            }
        }
    }
    return Array.from(paths).sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
}

const defaultCodeGenArgs: Partial<CodeGenArgs> = {
    language: 'typescript',
    frameworks: ['react', 'vite'],
    selectedTemplate: 'auto',
};

const resolveBehaviorType = (body: CodeGenArgs): BehaviorType => {
    if (body.behaviorType) return body.behaviorType;
    const pt = body.projectType;
    if (pt === 'presentation' || pt === 'workflow' || pt === 'general') return 'agentic';
    // default (including 'app' and when projectType omitted)
    return 'phasic';
};

const resolveProjectType = (body: CodeGenArgs): ProjectType | 'auto' => {
    return body.projectType || 'auto';
};


/**
 * CodingAgentController to handle all code generation related endpoints
 */
export class CodingAgentController extends BaseController {
    static logger = createLogger('CodingAgentController');

    /**
     * Import an external project from an uploaded .zip and start a build session
     * seeded with its files. Reuses startCodeGeneration so auth/limits/template/init
     * all behave identically — only the session is pre-populated with imported files.
     */
    static async importFromZip(request: Request, env: Env, ctx: ExecutionContext, context: RouteContext): Promise<Response> {
        try {
            // The zip is sent as the raw request body (Content-Type: application/zip).
            const zipBuffer = await request.arrayBuffer();
            if (!zipBuffer || zipBuffer.byteLength === 0) {
                return CodingAgentController.createErrorResponse('Empty upload — send the .zip as the request body', 400);
            }

            let extracted: TemplateFile[];
            try {
                extracted = ZipExtractor.extractFiles(zipBuffer);
            } catch (error) {
                return CodingAgentController.createErrorResponse(
                    `Could not read the zip: ${error instanceof Error ? error.message : 'unknown error'}`,
                    400,
                );
            }

            // Optional env vars (e.g. Supabase) sent base64-encoded in a header,
            // since the body is the raw zip.
            let envContent: string | undefined;
            const envHeader = request.headers.get('x-import-env');
            if (envHeader) {
                try {
                    envContent = atob(envHeader);
                } catch {
                    // ignore malformed env header
                }
            }

            return CodingAgentController.seedImportAndStart(extracted, request, env, ctx, context, 'zip', envContent);
        } catch (error) {
            this.logger.error('Import from zip failed', error);
            return CodingAgentController.createErrorResponse(
                `Import failed: ${error instanceof Error ? error.message : 'unknown error'}`,
                500,
            );
        }
    }

    /**
     * Import a public GitHub repo by URL. Fetches the branch archive zip from
     * codeload and reuses the same seed-and-start pipeline as the zip import.
     */
    static async importFromGithub(request: Request, env: Env, ctx: ExecutionContext, context: RouteContext): Promise<Response> {
        try {
            const body = (await request.json().catch(() => ({}))) as { url?: string; branch?: string; envVars?: string };
            const parsed = parseGithubUrl(body.url ?? '');
            if (!parsed) {
                return CodingAgentController.createErrorResponse('Invalid GitHub URL. Use https://github.com/owner/repo', 400);
            }

            // Try the requested branch first, then the common defaults.
            const candidates = [body.branch, parsed.branch, 'main', 'master'].filter(
                (b): b is string => typeof b === 'string' && b.length > 0,
            );
            let zipBuffer: ArrayBuffer | null = null;
            for (const branch of [...new Set(candidates)]) {
                const url = `https://codeload.github.com/${parsed.owner}/${parsed.repo}/zip/refs/heads/${branch}`;
                const response = await fetch(url, { headers: { 'user-agent': 'daisan-importer' } });
                if (response.ok) {
                    zipBuffer = await response.arrayBuffer();
                    break;
                }
            }
            if (!zipBuffer) {
                return CodingAgentController.createErrorResponse(
                    'Could not fetch the repository. Make sure it is public and the branch exists (only public repos are supported for now).',
                    400,
                );
            }

            let extracted: TemplateFile[];
            try {
                extracted = ZipExtractor.extractFiles(zipBuffer);
            } catch (error) {
                return CodingAgentController.createErrorResponse(
                    `Could not read the repository archive: ${error instanceof Error ? error.message : 'unknown error'}`,
                    400,
                );
            }

            return CodingAgentController.seedImportAndStart(extracted, request, env, ctx, context, 'github', body.envVars);
        } catch (error) {
            this.logger.error('Import from GitHub failed', error);
            return CodingAgentController.createErrorResponse(
                `GitHub import failed: ${error instanceof Error ? error.message : 'unknown error'}`,
                500,
            );
        }
    }

    /**
     * Shared import core: normalize + patch the extracted files, then delegate to
     * startCodeGeneration with the files seeded into a new plan-mode session.
     */
    private static async seedImportAndStart(
        extracted: TemplateFile[],
        request: Request,
        env: Env,
        ctx: ExecutionContext,
        context: RouteContext,
        importSource: 'zip' | 'github',
        envContent?: string,
    ): Promise<Response> {
        const normalized = normalizeImportedFiles(extracted);
        if (!normalized.some((f) => f.filePath === 'package.json')) {
            return CodingAgentController.createErrorResponse(
                'No package.json found at the project root. Only a single Vite/React project (not a monorepo) can be imported right now.',
                400,
            );
        }

        const externalFiles = normalized
            .map(patchImportedFile)
            .map((f) => ({ filePath: f.filePath, fileContents: f.fileContents }));

        // Seed a .env from user-provided vars (e.g. Supabase) so a Vite app that reads
        // import.meta.env.VITE_* boots instead of crashing on missing config.
        if (envContent && envContent.trim()) {
            const existing = externalFiles.find((f) => f.filePath === '.env');
            if (existing) {
                existing.fileContents = `${existing.fileContents.replace(/\s*$/, '')}\n${envContent.trim()}\n`;
            } else {
                externalFiles.unshift({ filePath: '.env', fileContents: `${envContent.trim()}\n` });
            }
        }

        const projectName = readImportedName(externalFiles) ?? 'imported-project';

        const codeGenBody: CodeGenArgs = {
            query: `I imported an existing project named "${projectName}". Install its dependencies, run it, and show me a live preview. Do NOT rebuild it from scratch — keep the imported code and wait for my instructions on what to change.`,
            externalFiles,
            importSource,
            mode: 'plan',
        };

        const jsonRequest = new Request(request.url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                cookie: request.headers.get('cookie') ?? '',
            },
            body: JSON.stringify(codeGenBody),
        });

        this.logger.info('Seeding import session', { fileCount: externalFiles.length, projectName, importSource });
        return CodingAgentController.startCodeGeneration(jsonRequest, env, ctx, context);
    }

    /**
     * Start the incremental code generation process
     */
    static async startCodeGeneration(request: Request, env: Env, _: ExecutionContext, context: RouteContext): Promise<Response> {
        try {
            this.logger.info('Starting code generation process');

            const url = new URL(request.url);
            const hostname = url.hostname === 'localhost' ? `localhost:${url.port}`: getPreviewDomain(env);
            // Parse the query from the request body
            let body: CodeGenArgs;
            try {
                body = await request.json() as CodeGenArgs;
            } catch (error) {
                return CodingAgentController.createErrorResponse(`Invalid JSON in request body: ${JSON.stringify(error, null, 2)}`, 400);
            }

            const query = body.query;
            if (typeof query !== 'string' || query.trim().length === 0) {
                return CodingAgentController.createErrorResponse('Missing "query" field in request body', 400);
            }
            // Resolve chat mode. Default to 'plan' (analyze only) for safety so new
            // sessions never mutate the project before the user reviews a plan.
            const mode: ChatMode = resolveChatMode(body.mode);
            if (query.length > MAX_AGENT_QUERY_LENGTH) {
                return CodingAgentController.createErrorResponse(
                    new SecurityError(
                        SecurityErrorType.INVALID_INPUT,
                        `Prompt too large (${query.length} characters). Maximum allowed is ${MAX_AGENT_QUERY_LENGTH} characters.`,
                        413,
                    ),
                    413,
                );
            }
            const { readable, writable } = new TransformStream({
                transform(chunk, controller) {
                    if (chunk === "terminate") {
                        controller.terminate();
                    } else {
                        const encoded = new TextEncoder().encode(JSON.stringify(chunk) + '\n');
                        controller.enqueue(encoded);
                    }
                }
            });
            const writer = writable.getWriter();
            // Check if user is authenticated (required for app creation)
            const user = context.user!;
            try {
                await RateLimitService.enforceAppCreationRateLimit(env, context.config.security.rateLimit, user, request);
            } catch (error) {
                if (error instanceof Error) {
                    return CodingAgentController.createErrorResponse(error, 429);
                } else {
                    this.logger.error('Unknown error in enforceAppCreationRateLimit', error);
                    return CodingAgentController.createErrorResponse(JSON.stringify(error), 429);
                }
            }

            const agentId = generateId();
            const modelConfigService = new ModelConfigService(env);
            const projectType = resolveProjectType(body);

            this.logger.info(`Resolved requested projectType: ${projectType} for agent ${agentId}`);
                                
            // Fetch all user model configs, api keys and agent instance at once
            const userConfigsRecord = await modelConfigService.getUserModelConfigs(user.id);
                                
            // Extract only user-overridden configs, stripping metadata fields
            const userModelConfigs: Record<string, ModelConfig> = {};
            for (const [actionKey, mergedConfig] of Object.entries(userConfigsRecord)) {
                if (mergedConfig.isUserOverride) {
                    const { isUserOverride, userConfigId, ...modelConfig } = mergedConfig;
                    userModelConfigs[actionKey] = modelConfig;
                }
            }

            const runtimeOverrides = credentialsToRuntimeOverrides(body.credentials);
            // Check usage limits BEFORE making AI calls.
            // The encrypted blob lives in an HttpOnly cookie; read it once here so we
            // can pass it down to the inference pipeline for BYOK decryption.
            const userToken = readTokenCookie(request, env);
            const limitResult = await checkUsageAndBalance(env, user.id, request, userToken);

            if (!limitResult.allowed) {
                this.logger.warn('Request blocked by usage check', {
                    userId: user.id,
                    reason: limitResult.reason,
                    withinLimits: limitResult.withinLimits,
                    hasUserToken: limitResult.hasUserToken,
                    balance: limitResult.balance,
                });
                
                const limit = limitResult.limit;
                const current = Number.isFinite(limit)
                    ? limit - limitResult.remaining
                    : 0;
                const percentUsed = Number.isFinite(limit) && limit > 0
                    ? Math.min(100, (current / limit) * 100)
                    : 0;

                throw new UsageLimitExceededError(
                    limitResult.reason || 'Usage limits exceeded',
                    [{
                        type: 'credits',
                        window: limitResult.windowKind ?? 'rolling',
                        current,
                        max: limit,
                        percentUsed,
                        resetAt: limitResult.resetAt,
                    }],
                    limitResult.hasUserToken
                );
            }

            // Get user's AI Gateway if using BYOK
            let userGateway: { accountId: string; gatewaySlug: string } | null = null;
            if (userToken) {
                userGateway = await getUserGateway(env, user.id);
            }

            // If the limit check transparently refreshed the token, use the fresh blob
            // downstream so inference decrypts to an unexpired access token.
            const effectiveUserToken = limitResult.refreshedBlob ?? userToken;

            const inferenceContext = {
                metadata: {
                    agentId: agentId,
                    userId: user.id,
                    shouldUseUserKey: limitResult.shouldUseByok,
                    userApiToken: effectiveUserToken,
                    userGateway,
                },
                userModelConfigs,
                runtimeOverrides,
                enableRealtimeCodeFix: false, // This costs us too much, so disabled it for now
                enableFastSmartCodeFix: false,
                shouldUseUserKey: limitResult.shouldUseByok, // Use BYOK if needed
                userApiToken: effectiveUserToken, // Encrypted blob from HttpOnly cookie (for BYOK)
                userGateway, // User's AI Gateway for BYOK
            }
                                
            this.logger.info(`Initialized inference context for user ${user.id}`, {
                modelConfigsCount: Object.keys(userModelConfigs).length,
                shouldUseUserKey: limitResult.shouldUseByok,
                balance: limitResult.balance,
                hasUserGateway: !!userGateway,
            });
            this.logger.info(`Creating project of type: ${projectType}`);

            const { templateDetails, selection, projectType: finalProjectType } = await getTemplateForQuery(env, inferenceContext, query, projectType, body.images, this.logger, body.selectedTemplate);
            const behaviorType = resolveBehaviorType({ ...body, projectType: finalProjectType });

            this.logger.info(`Resolved behaviorType: ${behaviorType}, finalProjectType: ${finalProjectType} for agent ${agentId}`);

            const websocketUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/agent/${agentId}/ws`;
            const httpStatusUrl = `${url.origin}/api/agent/${agentId}`;

            let uploadedImages: ProcessedImageAttachment[] = [];
            if (body.images) {
                uploadedImages = await Promise.all(body.images.map(async (image) => {
                    return uploadImage(env, image, ImageType.UPLOADS);
                }));
            }

            writer.write({
                message: 'Code generation started',
                agentId: agentId,
                websocketUrl,
                httpStatusUrl,
                behaviorType,
                projectType: finalProjectType,
                template: {
                    name: templateDetails.name,
                    files: getTemplateImportantFiles(templateDetails),
                }
            });
            const agentInstance = await getAgentStub(env, agentId, { behaviorType, projectType: finalProjectType });

            const baseInitArgs = {
                query,
                language: body.language || defaultCodeGenArgs.language,
                frameworks: body.frameworks || defaultCodeGenArgs.frameworks,
                hostname,
                inferenceContext,
                images: uploadedImages,
                onBlueprintChunk: (chunk: string) => {
                    writer.write({chunk});
                },
                mode,
            } as const;

            const initArgs = { ...baseInitArgs, externalFiles: body.externalFiles, importSource: body.importSource, templateInfo: { templateDetails, selection } }

            const agentPromise = agentInstance.initialize(initArgs) as Promise<AgentState>;
            agentPromise.then(async (_state: AgentState) => {
                writer.write("terminate");
                writer.close();
                this.logger.info(`Agent ${agentId} terminated successfully`);
            });

            this.logger.info(`Agent ${agentId} init launched successfully`);
            
            const streamHeaders = new Headers({
                // Use SSE content-type to ensure Cloudflare disables buffering,
                // while the payload remains NDJSON lines consumed by the client.
                'Content-Type': 'text/event-stream; charset=utf-8',
                // Prevent intermediary caches/proxies from buffering or transforming
                'Cache-Control': 'no-cache, no-store, must-revalidate, no-transform',
                'Pragma': 'no-cache',
                'Connection': 'keep-alive',
            });
            if (limitResult.refreshedCookie) {
                streamHeaders.append('Set-Cookie', limitResult.refreshedCookie);
            }
            return new Response(readable, {
                status: 200,
                headers: streamHeaders,
            });
        } catch (error) {
            this.logger.error('Error starting code generation', error);
            return CodingAgentController.handleError(error, 'start code generation');
        }
    }

    /**
     * Handle WebSocket connections for code generation
     * This routes the WebSocket connection directly to the Agent
     * 
     * Supports two authentication methods:
     * 1. Ticket-based auth (SDK): ?ticket=tk_xxx in URL
     * 2. JWT-based auth (Browser): Cookie/Header with origin validation
     */
    static async handleWebSocketConnection(
        request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext
    ): Promise<Response> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse('Missing agent ID parameter', 400);
            }

            // Ensure the request is a WebSocket upgrade request
            if (request.headers.get('Upgrade') !== 'websocket') {
                return new Response('Expected WebSocket upgrade', { status: 426 });
            }

            // User already authenticated via ticket OR JWT by middleware
            const user = context.user;
            if (!user) {
                return CodingAgentController.createErrorResponse('Authentication required', 401);
            }

            // Origin validation only for non-ticket auth (ticket auth is origin-agnostic)
            const isTicketAuth = hasTicketParam(request);
            if (!isTicketAuth && !validateWebSocketOrigin(request, env)) {
                return new Response('Forbidden: Invalid origin', { status: 403 });
            }

            this.logger.info('WebSocket connection authorized', {
                agentId,
                userId: user.id,
                authMethod: isTicketAuth ? 'ticket' : 'jwt',
            });

            try {
                // Get the agent instance to handle the WebSocket connection
                const agentInstance = await getAgentStub(env, agentId);

                // Let the agent handle the WebSocket connection directly
                return agentInstance.fetch(request);
            } catch (error) {
                this.logger.error(`Failed to get agent instance with ID ${agentId}:`, error);
                // Return an appropriate WebSocket error response
                const { 0: client, 1: server } = new WebSocketPair();

                server.accept();
                server.send(JSON.stringify({
                    type: WebSocketMessageResponses.ERROR,
                    error: `Failed to get agent instance: ${error instanceof Error ? error.message : String(error)}`
                }));

                server.close(1011, 'Agent instance not found');

                return new Response(null, {
                    status: 101,
                    webSocket: client
                });
            }
        } catch (error) {
            this.logger.error('Error handling WebSocket connection', error);
            return CodingAgentController.handleError(error, 'handle WebSocket connection');
        }
    }

    /**
     * Connect to an existing agent instance
     * Returns connection information for an already created agent
     */
    static async connectToExistingAgent(
        request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext
    ): Promise<ControllerResponse<ApiResponse<AgentConnectionData>>> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse<AgentConnectionData>('Missing agent ID parameter', 400);
            }

            this.logger.info(`Connecting to existing agent: ${agentId}`);

            try {
                // Verify the agent instance exists
                const agentInstance = await getAgentStub(env, agentId);
                if (!agentInstance || !(await agentInstance.isInitialized())) {
                    return CodingAgentController.createErrorResponse<AgentConnectionData>('Agent instance not found or not initialized', 404);
                }
                this.logger.info(`Successfully connected to existing agent: ${agentId}`);

                // Construct WebSocket URL
                const url = new URL(request.url);
                const websocketUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/agent/${agentId}/ws`;

                const responseData: AgentConnectionData = {
                    websocketUrl,
                    agentId,
                };

                return CodingAgentController.createSuccessResponse(responseData);
            } catch (error) {
                this.logger.error(`Failed to connect to agent ${agentId}:`, error);
                return CodingAgentController.createErrorResponse<AgentConnectionData>(`Agent instance not found or unavailable: ${error instanceof Error ? error.message : String(error)}`, 404);
            }
        } catch (error) {
            this.logger.error('Error connecting to existing agent', error);
            return CodingAgentController.handleError(error, 'connect to existing agent') as ControllerResponse<ApiResponse<AgentConnectionData>>;
        }
    }

    static async deployPreview(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext
    ): Promise<ControllerResponse<ApiResponse<AgentPreviewResponse>>> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse<AgentPreviewResponse>('Missing agent ID parameter', 400);
            }

            const appService = new AppService(env);
            const appResult = await appService.getAppDetails(agentId);

            if (!appResult) {
                return CodingAgentController.createErrorResponse<AgentPreviewResponse>('App not found', 404);
            }

            // Check if app is public
            if(appResult.visibility !== 'public') {
                // If user is logged in and is the owner, allow preview deployment
                const user = context.user;
                if (!user || user.id !== appResult.userId) {
                    return CodingAgentController.createErrorResponse<AgentPreviewResponse>('App is not public. Preview deployment is only available for public apps.', 403);
                }
            }
            this.logger.info(`Deploying preview for agent: ${agentId}`);

            try {
                // Get the agent instance
                const agentInstance = await getAgentStub(env, agentId);
                
                // Deploy the preview
                const preview = await agentInstance.deployToSandbox();
                if (!preview) {
                    return CodingAgentController.createErrorResponse<AgentPreviewResponse>('Failed to deploy preview', 500);
                }
                this.logger.info('Preview deployed successfully', {
                    agentId,
                    previewUrl: preview.previewURL
                });

                return CodingAgentController.createSuccessResponse(preview);
            } catch (error) {
                this.logger.error('Failed to deploy preview', { agentId, error });
                return CodingAgentController.createErrorResponse<AgentPreviewResponse>('Failed to deploy preview', 500);
            }
        } catch (error) {
            this.logger.error('Error deploying preview', error);
            const appError = CodingAgentController.handleError(error, 'deploy preview') as ControllerResponse<ApiResponse<AgentPreviewResponse>>;
            return appError;
        }
    }

    /**
     * Download the full project source as a zip archive (like Lovable's
     * "Download codebase"). Owner-only (enforced at the route). Builds the zip
     * in-memory from the agent's generated files — text files are UTF-8 encoded,
     * binary files (stored with a `base64:` prefix) are decoded back to bytes.
     */
    static async downloadCodebase(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return new Response('Missing agent ID parameter', { status: 400 });
            }

            const agentInstance = await getAgentStub(env, agentId);
            if (!agentInstance || !(await agentInstance.isInitialized())) {
                return new Response('Project not found or not initialized', { status: 404 });
            }

            const summary = await agentInstance.getSummary();
            const files = summary?.generatedCode ?? [];
            if (files.length === 0) {
                return new Response('No files to download yet', { status: 404 });
            }

            const encoder = new TextEncoder();
            const zipInput: Record<string, Uint8Array> = {};
            for (const file of files) {
                if (!file.filePath) {
                    continue;
                }
                const contents = file.fileContents ?? '';
                if (contents.startsWith('base64:')) {
                    const binary = atob(contents.slice('base64:'.length));
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    zipInput[file.filePath] = bytes;
                } else {
                    zipInput[file.filePath] = encoder.encode(contents);
                }
            }

            const archive = zipSync(zipInput, { level: 6 });

            let name = 'daisan-project';
            try {
                const appResult = await new AppService(env).getAppDetails(agentId);
                const rawName = appResult?.title || summary?.query || name;
                const slug = rawName.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
                if (slug) {
                    name = slug.slice(0, 60);
                }
            } catch {
                // Keep the default name if app lookup fails.
            }

            return new Response(archive, {
                status: 200,
                headers: {
                    'content-type': 'application/zip',
                    'content-disposition': `attachment; filename="${name}.zip"`,
                    'cache-control': 'no-store',
                },
            });
        } catch (error) {
            this.logger.error('Failed to download codebase', error);
            return new Response('Failed to build codebase archive', { status: 500 });
        }
    }

    /**
     * List the project's client-side routes so the preview can offer a route
     * navigator (address bar + dropdown, like Lovable). Owner-only via the route.
     */
    static async getProjectRoutes(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext,
    ): Promise<ControllerResponse<ApiResponse<{ routes: string[] }>>> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse<{ routes: string[] }>('Missing agent ID parameter', 400);
            }
            const agentInstance = await getAgentStub(env, agentId);
            if (!agentInstance || !(await agentInstance.isInitialized())) {
                return CodingAgentController.createErrorResponse<{ routes: string[] }>('Project not found or not initialized', 404);
            }
            const summary = await agentInstance.getSummary();
            const routes = extractRoutePaths(summary?.generatedCode ?? []);
            return CodingAgentController.createSuccessResponse({ routes });
        } catch (error) {
            return CodingAgentController.handleError(error, 'get project routes') as ControllerResponse<ApiResponse<{ routes: string[] }>>;
        }
    }

    /**
     * Real deployment diagnostics — answers WHY an app's URL shows
     * "App not found or not deployed yet" by probing the actual state:
     *  1) App record + generation status
     *  2) Whether a deploymentId (worker slug) exists
     *  3) Whether that worker is actually present in the dispatch namespace
     *     the router resolves against (authoritative — via Cloudflare API)
     *  4) Whether the live URL responds
     * Owner-only (enforced at the route).
     */
    static async getDeploymentDiagnostics(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext
    ): Promise<ControllerResponse<ApiResponse<DeploymentDiagnostics>>> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse<DeploymentDiagnostics>('Missing agent ID parameter', 400);
            }

            const appService = new AppService(env);
            const app = await appService.getAppDetails(agentId, context.user?.id);
            if (!app) {
                return CodingAgentController.createErrorResponse<DeploymentDiagnostics>('App not found', 404);
            }

            const deploymentId = app.deploymentId ?? null;
            const liveUrl = deploymentId ? buildUserWorkerUrl(env, deploymentId) : null;
            const namespace = ('DISPATCH_NAMESPACE' in env && env.DISPATCH_NAMESPACE)
                ? String(env.DISPATCH_NAMESPACE)
                : null;

            let workerInNamespace: boolean | null = null;
            let workerModifiedOn: string | null = null;
            let liveUrlStatus: number | null = null;

            // Probe the dispatch namespace (authoritative source of truth).
            if (deploymentId && namespace && env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) {
                try {
                    const cf = new CloudflareAPI(env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN);
                    const status = await cf.getDispatchScriptStatus(deploymentId, namespace);
                    workerInNamespace = status.exists;
                    workerModifiedOn = status.modifiedOn ?? null;
                } catch (e) {
                    this.logger.warn('Diagnostics: namespace probe failed', { agentId, error: e });
                    workerInNamespace = null;
                }
            }

            // Probe the live URL (best-effort; does not loop back to this worker).
            if (liveUrl) {
                try {
                    const res = await fetch(liveUrl, { method: 'GET', redirect: 'manual' });
                    liveUrlStatus = res.status;
                } catch {
                    liveUrlStatus = null;
                }
            }

            // Derive verdict.
            let severity: DeploymentDiagnostics['severity'] = 'unknown';
            let verdict = '';
            if (!deploymentId) {
                severity = 'not_deployed';
                verdict = app.status === 'generating'
                    ? 'App is still generating and has never been deployed to Cloudflare. Finish generation, then open the Studio and click Deploy.'
                    : 'This app has never been deployed to Cloudflare (no deployment slug). Open the Studio and click Deploy to publish it to a live URL.';
            } else if (workerInNamespace === false) {
                severity = 'failed';
                verdict = `A deployment slug exists ("${deploymentId}") but the worker is NOT present in namespace "${namespace}". The last deploy failed or the worker was removed — this is exactly what triggers "App not found or not deployed yet". Open the Studio and redeploy.`;
            } else if (workerInNamespace === true) {
                if (liveUrlStatus !== null && liveUrlStatus >= 200 && liveUrlStatus < 400) {
                    severity = 'ok';
                    verdict = `Healthy. Worker "${deploymentId}" is live in namespace "${namespace}" and the URL responds (${liveUrlStatus}).`;
                } else if (liveUrlStatus !== null) {
                    severity = 'degraded';
                    verdict = `Worker "${deploymentId}" is deployed in the namespace, but the live URL returned ${liveUrlStatus}. Likely a runtime/build/env error inside the app rather than a routing problem. Check the app's runtime and environment variables.`;
                } else {
                    severity = 'degraded';
                    verdict = `Worker "${deploymentId}" is deployed in the namespace, but the live URL could not be reached from the server. It may still load in a browser; verify directly.`;
                }
            } else {
                // Could not probe the namespace (missing creds/namespace).
                severity = 'unknown';
                verdict = namespace
                    ? 'Could not verify the namespace (Cloudflare credentials unavailable on the server). The app has a deployment slug; verify the live URL directly.'
                    : 'No dispatch namespace configured on the server, so namespace state could not be verified.';
            }

            const diagnostics: DeploymentDiagnostics = {
                appId: agentId,
                title: app.title,
                status: app.status,
                deploymentId,
                liveUrl,
                namespace,
                workerInNamespace,
                workerModifiedOn,
                liveUrlStatus,
                severity,
                verdict,
                checkedAt: new Date().toISOString(),
            };

            return CodingAgentController.createSuccessResponse(diagnostics);
        } catch (error) {
            this.logger.error('Error running deployment diagnostics', error);
            return CodingAgentController.handleError(error, 'run deployment diagnostics') as ControllerResponse<ApiResponse<DeploymentDiagnostics>>;
        }
    }

    /**
     * Deployment history timeline for an app (owner-only).
     */
    static async getDeploymentHistory(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext
    ): Promise<ControllerResponse<ApiResponse<DeploymentHistoryData>>> {
        try {
            const agentId = context.pathParams.agentId;
            if (!agentId) {
                return CodingAgentController.createErrorResponse<DeploymentHistoryData>('Missing agent ID parameter', 400);
            }
            const userId = context.user?.id;
            if (!userId) {
                return CodingAgentController.createErrorResponse<DeploymentHistoryData>('Unauthorized', 401);
            }

            const appService = new AppService(env);
            const app = await appService.getAppDetails(agentId, userId);
            if (!app) {
                return CodingAgentController.createErrorResponse<DeploymentHistoryData>('App not found', 404);
            }

            const rows = await new DeploymentHistoryService(env).listForApp(agentId, userId);
            return CodingAgentController.createSuccessResponse<DeploymentHistoryData>({
                deployments: rows.map((r) => ({
                    id: r.id,
                    status: r.status as DeploymentHistoryData['deployments'][number]['status'],
                    deploymentUrl: r.deploymentUrl ?? null,
                    deploymentId: r.deploymentId ?? null,
                    target: r.target ?? null,
                    error: r.error ?? null,
                    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
                })),
            });
        } catch (error) {
            this.logger.error('Error fetching deployment history', error);
            return CodingAgentController.handleError(error, 'fetch deployment history') as ControllerResponse<ApiResponse<DeploymentHistoryData>>;
        }
    }
}
