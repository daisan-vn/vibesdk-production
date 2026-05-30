import { BaseController } from '../baseController';
import { ApiResponse, ControllerResponse } from '../types';
import { RouteContext } from '../../types/route-context';
import { ModelConfigService } from '../../../database';
import { generateId } from '../../../utils/idGenerator';
import { executeInference } from '../../../agents/inferutils/infer';
import { createSystemMessage, createUserMessage } from '../../../agents/inferutils/common';
import { checkUsageAndBalance, getUserGateway } from '../../../services/rate-limit/usageChecker';
import { readTokenCookie } from '../../../utils/oauthCookie';
import { getDaisanContext } from '../../../agents/daisan-pipeline/context/daisan-context';
import type { ModelConfig } from '../../../agents/inferutils/config.types';

interface AdvisoryTurn {
	role: 'user' | 'assistant';
	content: string;
}

export interface AdvisoryResponseData {
	response: string;
}

type Prepared =
	| { ok: true; messages: ReturnType<typeof createUserMessage>[]; inferenceContext: unknown }
	| { ok: false; status: number; message: string };

/**
 * Advisory controller — conversational Q&A / consult / plan / learn / review.
 * Does NOT bootstrap a project or generate code. Powers the non-Build work modes.
 * Exposes a non-streaming (chat) and a streaming (chatStream) endpoint.
 */
export class AdvisoryController extends BaseController {
	/** Shared setup: auth-scoped model configs + usage/gateway + message list. */
	private static async prepare(request: Request, env: Env, userId: string): Promise<Prepared> {
		let body: { prompt?: string; history?: AdvisoryTurn[] };
		try {
			body = (await request.json()) as { prompt?: string; history?: AdvisoryTurn[] };
		} catch {
			return { ok: false, status: 400, message: 'Invalid JSON body' };
		}
		const prompt = (body.prompt || '').trim();
		if (!prompt) return { ok: false, status: 400, message: 'Prompt is required' };

		const modelConfigService = new ModelConfigService(env);
		const userConfigsRecord = await modelConfigService.getUserModelConfigs(userId);
		const userModelConfigs: Record<string, ModelConfig> = {};
		for (const [actionKey, mergedConfig] of Object.entries(userConfigsRecord)) {
			if (mergedConfig.isUserOverride) {
				const { isUserOverride, userConfigId, ...modelConfig } = mergedConfig;
				userModelConfigs[actionKey] = modelConfig;
			}
		}

		const userToken = readTokenCookie(request, env);
		const limitResult = await checkUsageAndBalance(env, userId, request, userToken);
		if (!limitResult.allowed) {
			return { ok: false, status: 429, message: limitResult.reason || 'Usage limit exceeded' };
		}
		const userGateway = userToken ? await getUserGateway(env, userId) : null;
		const effectiveUserToken = limitResult.refreshedBlob ?? userToken;

		const inferenceContext = {
			metadata: {
				agentId: generateId(),
				userId,
				shouldUseUserKey: limitResult.shouldUseByok,
				userApiToken: effectiveUserToken,
				userGateway,
			},
			userModelConfigs,
			enableRealtimeCodeFix: false,
			enableFastSmartCodeFix: false,
			shouldUseUserKey: limitResult.shouldUseByok,
			userApiToken: effectiveUserToken,
			userGateway,
		};

		const systemContext = getDaisanContext() ||
			'You are Daisan.ai, a professional Vietnamese AI assistant for the Daisan ecosystem.';
		const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
		const messages = [
			createSystemMessage(
				`${systemContext}\n\nĐây là phiên TƯ VẤN/HỎI-ĐÁP. Tuyệt đối KHÔNG sinh code dự án trừ khi người dùng yêu cầu ở chế độ Build. Trả lời bằng tiếng Việt chuyên nghiệp, súc tích, có ví dụ Daisan khi phù hợp.`,
			),
			...history.map((t) =>
				t.role === 'assistant' ? createSystemMessage(`(Trả lời trước) ${t.content}`) : createUserMessage(t.content),
			),
			createUserMessage(prompt),
		];

		return { ok: true, messages, inferenceContext };
	}

	/** Non-streaming advisory answer. */
	static async chat(
		request: Request,
		env: Env,
		_ctx: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<AdvisoryResponseData>>> {
		try {
			const user = context.user;
			if (!user) return AdvisoryController.createErrorResponse<AdvisoryResponseData>('Unauthorized', 401);

			const prepared = await AdvisoryController.prepare(request, env, user.id);
			if (!prepared.ok) {
				return AdvisoryController.createErrorResponse<AdvisoryResponseData>(prepared.message, prepared.status);
			}

			const result = await executeInference({
				env,
				messages: prepared.messages,
				agentActionName: 'conversationalResponse',
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				context: prepared.inferenceContext as any,
				maxTokens: 6000,
			});
			const text = result && typeof result === 'object' && 'string' in result ? (result.string as string) : '';
			return AdvisoryController.createSuccessResponse<AdvisoryResponseData>({
				response: text || 'Xin lỗi, tôi chưa tạo được câu trả lời. Vui lòng thử lại.',
			});
		} catch (error) {
			this.logger.error('Advisory chat error', error);
			return AdvisoryController.handleError(error, 'advisory chat') as ControllerResponse<ApiResponse<AdvisoryResponseData>>;
		}
	}

	/** Streaming advisory answer (text/plain chunks). */
	static async chatStream(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
		context: RouteContext,
	): Promise<Response> {
		const user = context.user;
		if (!user) return new Response('Unauthorized', { status: 401 });

		const prepared = await AdvisoryController.prepare(request, env, user.id);
		if (!prepared.ok) {
			return new Response(prepared.message, { status: prepared.status });
		}

		const encoder = new TextEncoder();
		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();

		const run = (async () => {
			try {
				await executeInference({
					env,
					messages: prepared.messages,
					agentActionName: 'conversationalResponse',
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					context: prepared.inferenceContext as any,
					maxTokens: 6000,
					stream: {
						chunk_size: 48,
						onChunk: (chunk: string) => {
							void writer.write(encoder.encode(chunk));
						},
					},
				});
			} catch (error) {
				this.logger.error('Advisory stream error', error);
				try {
					await writer.write(encoder.encode('\n\n[Lỗi: không tạo được câu trả lời. Vui lòng thử lại.]'));
				} catch {
					/* ignore */
				}
			} finally {
				try {
					await writer.close();
				} catch {
					/* ignore */
				}
			}
		})();

		ctx.waitUntil(run);

		return new Response(readable, {
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'no-store',
				'x-content-type-options': 'nosniff',
			},
		});
	}
}
