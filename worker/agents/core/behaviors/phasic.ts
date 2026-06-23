import {
    PhaseConceptGenerationSchemaType,
    PhaseConceptType,
    FileOutputType,
    PhaseImplementationSchemaType,
    type PhasicBlueprint,
} from '../../schemas';
import { readImportedName } from 'worker/services/imports/lovableAdapter';
import { StaticAnalysisResponse } from '../../../services/sandbox/sandboxTypes';
import { CurrentDevState, MAX_PHASES, PhasicState } from '../state';
import { createBuildJob, transition as buildTransition } from '../buildJob';
import { AllIssues, AgentInitArgs, PhaseExecutionResult, UserContext } from '../types';
import { WebSocketMessageResponses } from '../../constants';
import { UserConversationProcessor, buildToolCallRenderer, type ToolCallStatusArgs } from '../../operations/UserConversationProcessor';
import { GenerationContext, PhasicGenerationContext } from '../../domain/values/GenerationContext';
import { IssueReport } from '../../domain/values/IssueReport';
import { PhaseImplementationOperation } from '../../operations/PhaseImplementation';
import { FileRegenerationOperation } from '../../operations/FileRegeneration';
import { PhaseGenerationOperation } from '../../operations/PhaseGeneration';
import { FastCodeFixerOperation } from '../../operations/PostPhaseCodeFixer';
import { customizePackageJson, customizeTemplateFiles, generateProjectName } from '../../utils/templateCustomizer';
import { generateBlueprint } from '../../planning/blueprint';
import { getSupabaseScaffoldFiles, ensureSupabaseDep } from '../../utils/supabaseScaffold';
import { RateLimitExceededError } from 'shared/types/errors';
import {  ImageAttachment, type ProcessedImageAttachment } from '../../../types/image-attachment';
import { OperationOptions } from '../../operations/common';
import { ConversationMessage } from '../../inferutils/common';
import { generateNanoId } from 'worker/utils/idGenerator';
import { IdGenerator } from '../../utils/idGenerator';
import { BaseCodingBehavior, BaseCodingOperations } from './base';
import { ICodingAgent } from '../../services/interfaces/ICodingAgent';
import { SimpleCodeGenerationOperation } from '../../operations/SimpleCodeGeneration';
import { StateMigration } from '../stateMigration';
import { runPreDeploySafetyGate } from '../../utils/preDeploySafetyGate';

interface PhasicOperations extends BaseCodingOperations {
    generateNextPhase: PhaseGenerationOperation;
    implementPhase: PhaseImplementationOperation;
}

/**
 * PhasicCodingBehavior - Deterministically orchestrated agent
 * 
 * Manages the lifecycle of code generation including:
 * - Blueprint, phase generation, phase implementation, review cycles orchestrations
 * - File streaming with WebSocket updates
 * - Code validation and error correction
 * - Deployment to sandbox service
 */
export class PhasicCodingBehavior extends BaseCodingBehavior<PhasicState> implements ICodingAgent {
    protected static readonly PROJECT_NAME_PREFIX_MAX_LENGTH = 20;
    
    protected operations: PhasicOperations = {
        regenerateFile: new FileRegenerationOperation(),
        fastCodeFixer: new FastCodeFixerOperation(),
        processUserMessage: new UserConversationProcessor(),
        simpleGenerateFiles: new SimpleCodeGenerationOperation(),
        generateNextPhase: new PhaseGenerationOperation(),
        implementPhase: new PhaseImplementationOperation(),
    };

    private isFastPathRequest(phaseConcept: PhaseConceptType, userContext?: UserContext): boolean {
        const suggestion = userContext?.suggestions?.length === 1 ? userContext.suggestions[0] : '';
        const text = (suggestion || this.state.query || '').trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const isShort = text.length > 0 && text.length <= 140 && words <= 20;
        const hasImages = !!(userContext?.images && userContext.images.length > 0);
        const smallPhase = (phaseConcept.files?.length || 0) <= 4;
        return isShort && !hasImages && smallPhase;
    }

    /**
     * Initialize the code generator with project blueprint and template
     * Sets up services and begins deployment process
     */
    async initialize(
        initArgs: AgentInitArgs<PhasicState>,
        ..._args: unknown[]
    ): Promise<PhasicState> {
        await super.initialize(initArgs);
        const { templateInfo } = initArgs;
        if (!templateInfo || !templateInfo.templateDetails) {
            throw new Error('Phasic initialization requires templateInfo.templateDetails');
        }
        const { query, language, frameworks, hostname, inferenceContext, sandboxSessionId, useSupabase } = initArgs;
        
        // Generate a blueprint
        this.logger.info('Generating blueprint', { query, queryLength: query.length, imagesCount: initArgs.images?.length || 0 });
        this.logger.info(`Using language: ${language}, frameworks: ${frameworks ? frameworks.join(", ") : "none"}`);
        
        // Imports ship complete, runnable code — the (slow) AI blueprint just analyzes
        // code we won't regenerate, so skip it and go straight to seed + deploy. Use a
        // minimal valid blueprint to satisfy downstream state/plan-mode rendering.
        const isImport = Boolean(initArgs.externalFiles?.length);
        let blueprint: PhasicBlueprint;
        if (isImport) {
            const importedName = readImportedName(initArgs.externalFiles ?? []) ?? 'imported-project';
            this.logger.info('Import detected — skipping AI blueprint generation', {
                fileCount: initArgs.externalFiles?.length ?? 0,
                importedName,
            });
            blueprint = {
                title: 'Existing Project Import',
                projectName: importedName,
                description: 'Imported existing project — install dependencies and show a live preview.',
                colorPalette: [],
                frameworks: frameworks ?? [],
                detailedDescription:
                    'Imported project files are used as-is. No AI generation is performed; the sandbox installs dependencies and runs the existing app.',
                views: [],
                userFlow: { uiLayout: '', uiDesign: '', userJourney: '' },
                dataFlow: '',
                architecture: { dataFlow: '' },
                pitfalls: [],
                implementationRoadmap: [],
                initialPhase: {
                    name: 'Imported project',
                    description: 'Seeded imported files; no generation needed.',
                    files: [],
                    lastPhase: true,
                },
            };
        } else {
            // P2-P4: Daisan specialists run NON-BLOCKING (fire-and-forget) elsewhere
            // (see codingAgent.initialize → runSpecialistsToPlan) so they never delay
            // the blueprint / drop the WebSocket. They persist a reference plan instead.
            blueprint = await generateBlueprint({
                env: this.env,
                inferenceContext,
                query,
                language: language!,
                frameworks: frameworks!,
                templateDetails: templateInfo?.templateDetails,
                templateMetaInfo: templateInfo?.selection,
                images: initArgs.images,
                projectType: this.projectType,
                useSupabase,
                stream: {
                    chunk_size: 256,
                    onChunk: (chunk) => {
                        initArgs.onBlueprintChunk(chunk);
                    }
                }
            });
        }
                
        const packageJson = templateInfo.templateDetails.allFiles['package.json'];
                
        const projectName = generateProjectName(
            blueprint?.projectName || templateInfo?.templateDetails.name || '',
            generateNanoId(),
            PhasicCodingBehavior.PROJECT_NAME_PREFIX_MAX_LENGTH
        );
                        
        this.logger.info('Generated project name', { projectName });
                        
        const nextState: PhasicState = {
            ...this.state,
            projectName,
            query,
            blueprint,
            templateName: templateInfo.templateDetails.name,
            sandboxInstanceId: undefined,
            generatedPhases: [],
            commandsHistory: [],
            lastPackageJson: packageJson,
            sessionId: sandboxSessionId!,
            hostname,
            metadata: inferenceContext.metadata,
            projectType: this.projectType,
            behaviorType: 'phasic'
        };
        this.setState(nextState);
        // Customize template files (package.json, wrangler.jsonc, .bootstrap.js, .gitignore)
        const customizedFiles = customizeTemplateFiles(
            templateInfo.templateDetails.allFiles,
            {
                projectName,
                commandsHistory: []
            }
        );
        
        this.logger.info('Customized template files', { 
            files: Object.keys(customizedFiles) 
        });
        
        // Save customized files to git
        const filesToSave = Object.entries(customizedFiles).map(([filePath, content]) => ({
            filePath,
            fileContents: content,
            filePurpose: 'Project configuration file'
        }));
        
        await this.fileManager.saveGeneratedFiles(
            filesToSave,
            'Initialize project configuration files',
            true
        );
        
        this.logger.info('Committed customized template files to git');

        // P2: seed a deterministic Supabase auth + RBAC scaffold so generation builds on a
        // working foundation (client, auth context, ProtectedRoute, login/access-pending, SQL).
        if (useSupabase && !isImport) {
            const scaffold = getSupabaseScaffoldFiles();
            const basePkg = customizedFiles['package.json'] ?? packageJson;
            if (basePkg) {
                scaffold.push({
                    filePath: 'package.json',
                    fileContents: ensureSupabaseDep(basePkg),
                    filePurpose: 'Add @supabase/supabase-js dependency',
                });
            }
            await this.fileManager.saveGeneratedFiles(scaffold, 'chore: seed Supabase auth + RBAC scaffold', true);
            this.logger.info('Seeded Supabase scaffold', { fileCount: scaffold.length });
        }

        // Import flow: overlay the external project files on top of the base template.
        // Imported files take priority in FileManager, so the session starts from the
        // imported project (the template only provides sandbox scaffolding/config).
        if (initArgs.externalFiles?.length) {
            const importedFiles = initArgs.externalFiles.map((f) => ({
                filePath: f.filePath,
                fileContents: f.fileContents,
                filePurpose: 'Imported external file',
            }));
            await this.fileManager.saveGeneratedFiles(
                importedFiles,
                `Import: ${importedFiles.length} files from ${initArgs.importSource ?? 'external'} project`,
                true,
            );
            this.logger.info('Seeded imported external files', { count: importedFiles.length });

            // An imported project ships a complete, runnable app — the seeded files ARE
            // the implementation. Without this, the build sits at 0 completed phases
            // (deployable=false), so the preview is never maintained and "Deploy to
            // Cloudflare" stays disabled. Mark the job as one completed, deployable phase
            // so an import behaves like a generated app: preview kept + Deploy enabled.
            const prevJob = this.state.buildJob ?? createBuildJob(Date.now());
            const deployableJob = buildTransition(prevJob, 'generating_code', Date.now(), {
                note: 'imported project seeded (deployable)',
                patch: { completedPhases: 1, deployable: true, requiredPhasesTotal: 1 },
            });
            this.setState({ ...this.state, buildJob: deployableJob });
            this.broadcast(WebSocketMessageResponses.BUILD_STATE, { buildJob: deployableJob });
        }

        this.initializeAsync().catch((error: unknown) => {
            this.broadcastError("Initialization failed", error);
        });
        this.logger.info(`Agent ${this.getAgentId()} session: ${this.state.sessionId} initialized successfully`);
        return this.state;
    }

    async onStart(props?: Record<string, unknown> | undefined): Promise<void> {
        await super.onStart(props);
    }

    migrateStateIfNeeded(): void {
        const migratedState = StateMigration.migratePhasic(this.state, this.logger) as PhasicState | null;
        if (migratedState) {
            this.setState(migratedState);
        }

        // migrate overwritten package.jsons
        const oldPackageJson = this.fileManager.getFile('package.json')?.fileContents || this.state.lastPackageJson;
        if (oldPackageJson) {
            const packageJson = customizePackageJson(oldPackageJson, this.state.projectName);
            this.fileManager.saveGeneratedFiles([
                {
                    filePath: 'package.json',
                    fileContents: packageJson,
                    filePurpose: 'Project configuration file'
                }
            ], 'chore: fix overwritten package.json', true);
        }
    }

    rechargePhasesCounter(max_phases: number = MAX_PHASES): void {
        if (this.getPhasesCounter() <= max_phases) {
            this.setState({
                ...this.state,
                phasesCounter: max_phases
            });
        }
    }

    decrementPhasesCounter(): number {
        const counter = this.getPhasesCounter() - 1;
        this.setState({
            ...this.state,
            phasesCounter: counter
        });
        return counter;
    }

    getPhasesCounter(): number {
        return this.state.phasesCounter;
    }

    getOperationOptions(): OperationOptions<PhasicGenerationContext> {
        const context = GenerationContext.from(this.state, this.getTemplateDetails(), this.logger);
        if (!GenerationContext.isPhasic(context)) {
            throw new Error('Expected PhasicGenerationContext');
        }
        return {
            env: this.env,
            agentId: this.getAgentId(),
            context,
            logger: this.logger,
            inferenceContext: this.getInferenceContext(),
            agent: this
        };
    }

    private createNewIncompletePhase(phaseConcept: PhaseConceptType) {
        this.setState({
            ...this.state,
            generatedPhases: [...this.state.generatedPhases, {
                ...phaseConcept,
                completed: false
            }]
        })

        this.logger.info("Created new incomplete phase:", JSON.stringify(this.state.generatedPhases, null, 2));
    }

    private markPhaseComplete(phaseName: string) {
        // First find the phase
        const phases = this.state.generatedPhases;
        if (!phases.some(p => p.name === phaseName)) {
            this.logger.warn(`Phase ${phaseName} not found in generatedPhases array, skipping save`);
            return;
        }
        
        // Update the phase
        this.setState({
            ...this.state,
            generatedPhases: phases.map(p => p.name === phaseName ? { ...p, completed: true } : p)
        });

        this.logger.info("Completed phases:", JSON.stringify(phases, null, 2));
    }

    async queueUserRequest(request: string, images?: ProcessedImageAttachment[]): Promise<void> {
        this.rechargePhasesCounter(3);
        await super.queueUserRequest(request, images);
    }

    async build(): Promise<void> {
        // Plan mode: never mutate the project. The blueprint (already generated and
        // shown to the user) is the implementation plan. Surface a structured
        // summary + CTA and stop before any code/file/deploy work happens.
        if (this.state.executionMode === 'plan') {
            this.presentPlanModeResponse();
            return;
        }
        await this.launchStateMachine();
    }

    private presentPlanModeResponse(): void {
        const bp = this.state.blueprint;
        const conversationId = IdGenerator.generateConversationId();
        const frameworks = Array.isArray(bp?.frameworks) ? bp.frameworks.join(', ') : '';
        const content = [
            `## 📋 Implementation Plan — ${bp?.title || this.state.query}`,
            ``,
            `**Goal:** ${bp?.description || this.state.query}`,
            frameworks ? `**Key modules / dependencies:** ${frameworks}` : '',
            ``,
            `_Plan mode — no files, database, configuration, migrations or deployments were changed._ The full structure (views, user flow, data model) is shown in the Blueprint panel above.`,
            ``,
            `**Review this plan, then switch to Build mode to implement.**`,
        ].filter(Boolean).join('\n');

        this.setState({
            ...this.state,
            shouldBeGenerating: false,
            latestPlanId: conversationId,
            latestPlanStatus: 'draft',
        });

        this.broadcast(WebSocketMessageResponses.CONVERSATION_RESPONSE, {
            message: content,
            conversationId,
            isStreaming: false,
        });
    }

    private async launchStateMachine() {
        this.logger.info("Launching state machine");

        let currentDevState = CurrentDevState.PHASE_IMPLEMENTING;
        const generatedPhases = this.state.generatedPhases;
        const incompletedPhases = generatedPhases.filter(phase => !phase.completed);
        let phaseConcept : PhaseConceptType | undefined;
        if (incompletedPhases.length > 0) {
            phaseConcept = incompletedPhases[incompletedPhases.length - 1];
            this.logger.info('Resuming code generation from incompleted phase', {
                phase: phaseConcept
            });
        } else if (generatedPhases.length > 0) {
            currentDevState = CurrentDevState.PHASE_GENERATING;
            this.logger.info('Resuming code generation after generating all phases', {
                phase: generatedPhases[generatedPhases.length - 1]
            });
        } else {
            phaseConcept = this.state.blueprint.initialPhase;
            this.logger.info('Starting code generation from initial phase', {
                phase: phaseConcept
            });
            this.createNewIncompletePhase(phaseConcept);
        }

        let userContext: UserContext | undefined;
        if (phaseConcept && this.state.generatedPhases.length === 1 && this.state.pendingUserInputs.length > 0) {
            const pendingUserInputs = this.fetchPendingUserRequests();
            userContext = {
                suggestions: pendingUserInputs,
                images: this.pendingUserImages,
            };
            if (this.pendingUserImages.length > 0) {
                this.pendingUserImages = [];
            }
            this.logger.info('Applying pending user inputs to initial phase', {
                suggestionsCount: pendingUserInputs.length,
                imageCount: userContext.images?.length || 0,
            });
        }

        try {
            let executionResults: PhaseExecutionResult;
            // State machine loop - continues until IDLE state
            while (currentDevState !== CurrentDevState.IDLE) {
                // Honour a stop request between phases. cancelCurrentInference() only
                // aborts an in-flight model call; this closes the gap when the user
                // hits Stop in the brief window between phases.
                if (!this.state.shouldBeGenerating) {
                    this.logger.info('[generateAllFiles] Stop requested — exiting state machine');
                    break;
                }
                this.logger.info(`[generateAllFiles] Executing state: ${currentDevState}`);
                switch (currentDevState) {
                    case CurrentDevState.PHASE_GENERATING:
                        executionResults = await this.executePhaseGeneration();
                        currentDevState = executionResults.currentDevState;
                        phaseConcept = executionResults.result;
                        userContext = executionResults.userContext;
                        break;
                    case CurrentDevState.PHASE_IMPLEMENTING:
                        executionResults = await this.executePhaseImplementation(phaseConcept, userContext);
                        currentDevState = executionResults.currentDevState;
                        userContext = undefined;
                        break;
                    case CurrentDevState.REVIEWING:
                        currentDevState = await this.executeReviewCycle();
                        break;
                    case CurrentDevState.FINALIZING:
                        currentDevState = await this.executeFinalizing();
                        break;
                    default:
                        break;
                }
            }

            this.logger.info("State machine completed successfully");
        } catch (error) {
            this.logger.error("Error in state machine:", error);
        }
    }

    /**
     * Execute phase generation state - generate next phase with user suggestions
     */
    async executePhaseGeneration(isFinal?: boolean): Promise<PhaseExecutionResult> {
        this.logger.info("Executing PHASE_GENERATING state");
        try {
            const currentIssues = await this.fetchAllIssues();
            
            // Generate next phase with user suggestions if available
            
            // Get stored images if user suggestions are present
            const pendingUserInputs = this.fetchPendingUserRequests();
            const userContext = (pendingUserInputs.length > 0) 
                ? {
                    suggestions: pendingUserInputs,
                    images: this.pendingUserImages
                } as UserContext
                : undefined;

            if (userContext && userContext?.suggestions && userContext.suggestions.length > 0) {
                // Only reset pending user inputs if user suggestions were read
                this.logger.info("Resetting pending user inputs", { 
                    userSuggestions: userContext.suggestions,
                    hasImages: !!userContext.images,
                    imageCount: userContext.images?.length || 0
                });
                
                // Clear images after they're passed to phase generation
                if (userContext?.images && userContext.images.length > 0) {
                    this.logger.info('Clearing stored user images after passing to phase generation');
                    this.pendingUserImages = [];
                }
            }
            
            const nextPhase = await this.generateNextPhase(currentIssues, userContext, isFinal);
                
            if (!nextPhase) {
                this.logger.info("No more phases to implement, transitioning to FINALIZING");
                return {
                    currentDevState: CurrentDevState.FINALIZING,
                };
            }
    
            // Store current phase and transition to implementation
            this.setState({
                ...this.state,
                currentPhase: nextPhase
            });
            
            return {
                currentDevState: CurrentDevState.PHASE_IMPLEMENTING,
                result: nextPhase,
                userContext: userContext,
            };
        } catch (error) {
            if (error instanceof RateLimitExceededError) {
                throw error;
            }
            this.broadcastError("Error generating phase", error);
            return {
                currentDevState: CurrentDevState.IDLE,
            };
        }
    }

    /**
     * Execute phase implementation state - implement current phase
     */
    async executePhaseImplementation(phaseConcept?: PhaseConceptType, userContext?: UserContext): Promise<{currentDevState: CurrentDevState, staticAnalysis?: StaticAnalysisResponse}> {
        try {
            this.logger.info("Executing PHASE_IMPLEMENTING state");
    
            if (phaseConcept === undefined) {
                phaseConcept = this.state.currentPhase;
                if (phaseConcept === undefined) {
                    this.logger.error("No phase concept provided to implement, will call phase generation");
                    const results = await this.executePhaseGeneration();
                    phaseConcept = results.result;
                    if (phaseConcept === undefined) {
                        this.logger.error("No phase concept provided to implement, will return");
                        return {currentDevState: CurrentDevState.FINALIZING};
                    }
                }
            }
    
            this.setState({
                ...this.state,
                currentPhase: undefined // reset current phase
            });
            
            // Prepare issues for implementation
            const fastPath = this.isFastPathRequest(phaseConcept, userContext);
            const currentIssues = fastPath
                ? {
                    runtimeErrors: await this.fetchRuntimeErrors(true),
                    staticAnalysis: { success: true, lint: { issues: [] }, typecheck: { issues: [] } },
                }
                : await this.fetchAllIssues(true);
            
            // Implement the phase with user context (suggestions and images)
            await this.implementPhase(phaseConcept, currentIssues, userContext, true, !fastPath);
    
            this.logger.info(`Phase ${phaseConcept.name} completed, generating next phase`);

            const phasesCounter = this.decrementPhasesCounter();

            if ((phaseConcept.lastPhase || phasesCounter <= 0) && this.state.pendingUserInputs.length === 0) return {currentDevState: CurrentDevState.FINALIZING};
            return {currentDevState: CurrentDevState.PHASE_GENERATING};
        } catch (error) {
            this.logger.error("Error implementing phase", error);
            if (error instanceof RateLimitExceededError) {
                throw error;
            }
            return {currentDevState: CurrentDevState.IDLE};
        }
    }

    /**
     * Execute review cycle state — AUTOMATIC auto-fix loop.
     * Lovable-style: rather than merely asking the user, detect build/runtime/
     * type errors and auto-fix them (deep_debug) in a bounded loop BEFORE the
     * app is considered done, so generated apps don't ship broken. Only if
     * issues still remain after the loop do we fall back to asking the user.
     */
    async executeReviewCycle(): Promise<CurrentDevState> {
        this.logger.info("Executing REVIEWING state - automatic auto-fix loop");
        if (this.state.reviewingInitiated) {
            this.logger.info("Reviewing already initiated, skipping");
            return CurrentDevState.IDLE;
        }
        this.setState({
            ...this.state,
            reviewingInitiated: true
        });

        const MAX_FIX_ROUNDS = 1;
        const conversationId = IdGenerator.generateConversationId();
        const responseCb = (message: string, convId: string, isStreaming: boolean, tool?: ToolCallStatusArgs) => {
            this.broadcast(WebSocketMessageResponses.CONVERSATION_RESPONSE, { message, conversationId: convId, isStreaming, tool });
        };
        const toolRenderer = buildToolCallRenderer(responseCb, conversationId);
        const streamCb = (chunk: string) => responseCb(chunk, conversationId, true);
        const countIssues = (issues: AllIssues): number =>
            issues.runtimeErrors.length + issues.staticAnalysis.typecheck.issues.length;

        for (let round = 1; round <= MAX_FIX_ROUNDS; round++) {
            const issues = await this.fetchAllIssues(false);
            const renderErrors = await this.captureRenderTimeErrors();
            const total = countIssues(issues) + renderErrors.length;
            if (total === 0) {
                if (round > 1) {
                    this.broadcast(WebSocketMessageResponses.CONVERSATION_RESPONSE, {
                        message: '✅ Auto-fix complete — the app builds and runs with no detected errors.',
                        conversationId,
                        isStreaming: false,
                    });
                }
                this.logger.info('Review: no issues found, app is healthy', { round });
                return CurrentDevState.IDLE;
            }

            this.logger.info('Review: auto-fixing issues', {
                round,
                total,
                runtime: issues.runtimeErrors.length,
                typecheck: issues.staticAnalysis.typecheck.issues.length,
            });
            this.broadcast(WebSocketMessageResponses.CONVERSATION_RESPONSE, {
                message: `Found ${total} issue(s) — auto-fixing now (round ${round}/${MAX_FIX_ROUNDS})…`,
                conversationId,
                isStreaming: false,
            });

            const renderDetail = renderErrors.length
                ? ` and ${renderErrors.length} render-time client error(s) captured by loading the app in a real browser: ${renderErrors.join(' | ')}.`
                : '';
            const issueDesc = `The app currently has errors and does not run cleanly: ${issues.runtimeErrors.length} runtime error(s)${issues.staticAnalysis.typecheck.issues.length ? ` and ${issues.staticAnalysis.typecheck.issues.length} type error(s)` : ''}${renderDetail} Investigate the root cause (read the error messages and the responsible files) and fix them so the app builds and renders with NO runtime, build, or type errors. Common culprits to check: react-router hooks (useLocation/useNavigate) used outside a <BrowserRouter>/RouterProvider; invalid CSS/Tailwind syntax; and accessing undefined/null data without guards.`;

            try {
                const result = await this.executeDeepDebug(issueDesc, toolRenderer, streamCb);
                if (!result.success) {
                    this.logger.warn('Auto-fix round did not complete', { round, error: result.error });
                    break;
                }
            } catch (error) {
                this.logger.warn('Auto-fix round threw', { round, error });
                break;
            }
        }

        // Final check — if issues persist after the auto-fix loop, fall back to
        // asking the user (the previous behaviour) instead of looping forever.
        const remaining = await this.fetchAllIssues(false);
        const remainingRender = await this.captureRenderTimeErrors();
        if (countIssues(remaining) + remainingRender.length > 0) {
            this.logger.info('Review: issues remain after auto-fix, asking user', { remaining: countIssues(remaining) });
            const message: ConversationMessage = {
                role: "assistant",
                content: `<system_context>If the user responds with yes, launch the 'deep_debug' tool with the prompt to fix all the issues in the app</system_context>\nI auto-fixed what I could, but a few issues still remain. Want me to keep trying to fix them?`,
                conversationId: IdGenerator.generateConversationId(),
            };
            this.infrastructure.addConversationMessage(message);
            this.broadcast(WebSocketMessageResponses.CONVERSATION_RESPONSE, {
                message: message.content,
                conversationId: message.conversationId,
                isStreaming: false,
            });
        }

        return CurrentDevState.IDLE;
    }

    /**
     * Execute finalizing state - final review and cleanup (runs only once)
     */
    async executeFinalizing(): Promise<CurrentDevState> {
        this.logger.info("Executing FINALIZING state - final review and cleanup");

        if (this.setMVPGenerated()) {
            this.logger.info("Finalizing stage already done");
            return CurrentDevState.REVIEWING;
        }

        const { result: phaseConcept, userContext } = await this.executePhaseGeneration(true);
        if (!phaseConcept) {
            this.logger.warn("Phase concept not generated, skipping final review");
            return CurrentDevState.REVIEWING;
        }
        
        await this.executePhaseImplementation(phaseConcept, userContext);

        const numFilesGenerated = this.fileManager.getGeneratedFilePaths().length;
        this.logger.info(`Finalization complete. Generated ${numFilesGenerated}/${this.getTotalFiles()} files.`);

        // Transition to IDLE - generation complete
        return CurrentDevState.REVIEWING;
    }

    /**
     * Generate next phase with user context (suggestions and images)
     */
    async generateNextPhase(currentIssues: AllIssues, userContext?: UserContext, isFinal?: boolean): Promise<PhaseConceptGenerationSchemaType | undefined> {
        const issues = IssueReport.from(currentIssues);
        
        // Build notification message
        let notificationMsg = "Generating next phase";
        if (isFinal) {
            notificationMsg = "Generating final phase";
        }
        if (userContext?.suggestions && userContext.suggestions.length > 0) {
            notificationMsg = `Generating next phase incorporating ${userContext.suggestions.length} user suggestion(s)`;
        }
        if (userContext?.images && userContext.images.length > 0) {
            notificationMsg += ` with ${userContext.images.length} image(s)`;
        }
        
        // Notify phase generation start
        this.broadcast(WebSocketMessageResponses.PHASE_GENERATING, {
            message: notificationMsg,
            issues: issues,
            userSuggestions: userContext?.suggestions,
        });
        
        const result = await this.operations.generateNextPhase.execute(
            {
                issues,
                userContext,
                isUserSuggestedPhase: userContext?.suggestions && userContext.suggestions.length > 0 && this.state.mvpGenerated,
                isFinal: isFinal ?? false,
            },
            this.getOperationOptions()
        )
        // Execute install commands if any
        if (result.installCommands && result.installCommands.length > 0) {
            this.executeCommands(result.installCommands);
        }

        // Execute delete commands if any
        const filesToDelete = result.files.filter(f => f.changes?.toLowerCase().trim() === 'delete');
        if (filesToDelete.length > 0) {
            this.logger.info(`Deleting ${filesToDelete.length} files: ${filesToDelete.map(f => f.path).join(", ")}`);
            this.deleteFiles(filesToDelete.map(f => f.path));
        }
        
        if (result.files.length === 0) {
            this.logger.info("No files generated for next phase");
            // Notify phase generation complete
            this.broadcast(WebSocketMessageResponses.PHASE_GENERATED, {
                message: `No files generated for next phase`,
                phase: undefined
            });
            return undefined;
        }
        
        this.createNewIncompletePhase(result);
        // Notify phase generation complete
        this.broadcast(WebSocketMessageResponses.PHASE_GENERATED, {
            message: `Generated next phase: ${result.name}`,
            phase: result
        });

        return result;
    }

    /**
     * Implement a single phase of code generation
     * Streams file generation with real-time updates and incorporates technical instructions
     */
    async implementPhase(phase: PhaseConceptType, currentIssues: AllIssues, userContext?: UserContext, streamChunks: boolean = true, postPhaseFixing: boolean = true): Promise<PhaseImplementationSchemaType> {
        const issues = IssueReport.from(currentIssues);
        
        const implementationMsg = userContext?.suggestions && userContext.suggestions.length > 0
            ? `Implementing phase: ${phase.name} with ${userContext.suggestions.length} user suggestion(s)`
            : `Implementing phase: ${phase.name}`;
        const msgWithImages = userContext?.images && userContext.images.length > 0
            ? `${implementationMsg} and ${userContext.images.length} image(s)`
            : implementationMsg;
            
        this.broadcast(WebSocketMessageResponses.PHASE_IMPLEMENTING, {
            message: msgWithImages,
            phase: phase,
            issues: issues,
        });
            
        
        const result = await this.operations.implementPhase.execute(
            {
                phase, 
                issues, 
                isFirstPhase: this.state.generatedPhases.filter(p => p.completed).length === 0,
                fileGeneratingCallback: (filePath: string, filePurpose: string) => {
                    this.broadcast(WebSocketMessageResponses.FILE_GENERATING, {
                        message: `Generating file: ${filePath}`,
                        filePath: filePath,
                        filePurpose: filePurpose
                    });
                },
                userContext,
                shouldAutoFix: this.getInferenceContext().enableRealtimeCodeFix,
                fileChunkGeneratedCallback: streamChunks ? (filePath: string, chunk: string, format: 'full_content' | 'unified_diff') => {
                    this.broadcast(WebSocketMessageResponses.FILE_CHUNK_GENERATED, {
                        message: `Generating file: ${filePath}`,
                        filePath: filePath,
                        chunk,
                        format,
                    });
                } : (_filePath: string, _chunk: string, _format: 'full_content' | 'unified_diff') => {},
                fileClosedCallback: (file: FileOutputType, message: string) => {
                    this.broadcast(WebSocketMessageResponses.FILE_GENERATED, {
                        message,
                        file,
                    });
                }
            },
            this.getOperationOptions()
        );
        
        this.broadcast(WebSocketMessageResponses.PHASE_VALIDATING, {
            message: `Validating files for phase: ${phase.name}`,
            phase: phase,
        });

        // Await the already-created realtime code fixer promises
        const finalFiles = await Promise.allSettled(result.fixedFilePromises).then((results: PromiseSettledResult<FileOutputType>[]) => {
            return results.map((result) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    return null;
                }
            }).filter((f): f is FileOutputType => f !== null);
        });
    
        const templateDetails = this.getTemplateDetails();
        const safeFiles = templateDetails
            ? await runPreDeploySafetyGate({
                  files: finalFiles,
                  env: this.env,
                  inferenceContext: this.getInferenceContext(),
                  query: this.state.query,
                  template: templateDetails,
                  phase,
              })
            : finalFiles;

        await this.fileManager.saveGeneratedFiles(safeFiles, `feat: ${phase.name}\n\n${phase.description}`);

        this.logger.info("Files generated for phase:", phase.name, safeFiles.map(f => f.filePath));

        if (result.commands && result.commands.length > 0) {
            this.logger.info("Phase implementation suggested install commands:", result.commands);
            await this.executeCommands(result.commands, false);
        }

        if (safeFiles.length > 0) {
            await this.deployToSandbox(safeFiles, false, phase.name, true);
            if (postPhaseFixing) {
                await this.applyDeterministicCodeFixes();
                if (this.getInferenceContext().enableFastSmartCodeFix) {
                    await this.applyFastSmartCodeFixes();
                }
            }
        }

        // Validation complete
        this.broadcast(WebSocketMessageResponses.PHASE_VALIDATED, {
            message: `Files validated for phase: ${phase.name}`,
            phase: phase
        });
    
        this.logger.info("Files generated for phase:", phase.name, finalFiles.map(f => f.filePath));
    
        this.logger.info(`Validation complete for phase: ${phase.name}`);
    
        // Notify phase completion
        this.broadcast(WebSocketMessageResponses.PHASE_IMPLEMENTED, {
            phase: {
                name: phase.name,
                files: safeFiles.map(f => ({
                    path: f.filePath,
                    purpose: f.filePurpose,
                    contents: f.fileContents
                })),
                description: phase.description
            },
            message: "Files generated successfully for phase"
        });
    
        this.markPhaseComplete(phase.name);
        
        return {
            files: safeFiles,
            deploymentNeeded: result.deploymentNeeded,
            commands: result.commands
        };
    }

    getTotalFiles(): number {
        return this.fileManager.getGeneratedFilePaths().length + ((this.state.currentPhase || this.state.blueprint.initialPhase)?.files?.length || 0);
    }

    private async applyFastSmartCodeFixes() : Promise<void> {
        try {
            const startTime = Date.now();
            this.logger.info("Applying fast smart code fixes");
            // Get static analysis and do deterministic fixes
            const staticAnalysis = await this.runStaticAnalysisCode();
            if (staticAnalysis.typecheck.issues.length + staticAnalysis.lint.issues.length == 0) {
                this.logger.info("No issues found, skipping fast smart code fixes");
                return;
            }
            const issues = staticAnalysis.typecheck.issues.concat(staticAnalysis.lint.issues);
            const allFiles = this.fileManager.getAllRelevantFiles();

            const fastCodeFixer = await this.operations.fastCodeFixer.execute({
                query: this.state.query,
                issues,
                allFiles,
            }, this.getOperationOptions());

            if (fastCodeFixer.length > 0) {
                await this.fileManager.saveGeneratedFiles(fastCodeFixer, "fix: Fast smart code fixes");
                await this.deployToSandbox(fastCodeFixer);
                this.logger.info("Fast smart code fixes applied successfully");
            }
            this.logger.info(`Fast smart code fixes applied in ${Date.now() - startTime}ms`);            
        } catch (error) {
            this.broadcastError("Failed to apply fast smart code fixes", error);
            return;
        }
    }

    async handleUserInput(userMessage: string, images?: ImageAttachment[]): Promise<void> {
        const pendingBefore = this.state.pendingUserInputs.length;
        await super.handleUserInput(userMessage, images);

        // Reliability: in Build mode a change request must be IMPLEMENTED, not just
        // acknowledged. The conversational layer is supposed to relay it via
        // queue_request, but it sometimes only replies "I'll do it next phase"
        // without actually queuing — so nothing gets built. If we're idle (a
        // completed app), in Build mode, nothing was queued by the conversation, and
        // the user sent a real message, queue it directly so it actually gets built.
        if (
            this.state.executionMode !== 'plan' &&
            !this.state.shouldBeGenerating &&
            this.state.pendingUserInputs.length === pendingBefore &&
            userMessage.trim().length > 0
        ) {
            this.logger.info('Build-mode message was not queued by the conversational layer — queuing it directly so it gets built', {
                messageLength: userMessage.length,
            });
            await this.queueUserRequest(userMessage);
        }

        // Lovable-style live iteration: the conversational turn relays change
        // requests via queue_request (-> pendingUserInputs), but on an already-
        // completed app the phase state machine is IDLE, so nothing consumes the
        // queue and the edit silently waits for a manual rebuild. If we're idle
        // (not mid-generation) and in Build mode, relaunch the state machine so
        // the queued edits are implemented now and the preview refreshes.
        if (
            this.state.executionMode !== 'plan' &&
            !this.state.shouldBeGenerating &&
            this.state.pendingUserInputs.length > 0
        ) {
            this.logger.info('Idle app has queued user request(s) — relaunching state machine to apply them live', {
                pendingCount: this.state.pendingUserInputs.length,
            });
            this.setState({ ...this.state, shouldBeGenerating: true });
            // Fire-and-forget: progress streams over WebSocket; don't block the
            // user-input handler for the entire (multi-phase) generation.
            this.launchStateMachine().catch((error) => {
                this.logger.error('Relaunched state machine after user input failed', error);
            });
        }
    }
}
