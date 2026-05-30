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

/**
 * Advisory controller — conversational Q&A / consult / plan / learn / review.
 * Does NOT bootstrap a project or generate code: it just calls the LLM with the
 * Daisan + work-mode context and returns the answer. This is the "advisory route"
 * that powers the non-Build work modes (Hỏi / Tư vấn / Kế hoạch / Học / Review / Sửa lỗi).
 */
export class AdvisoryController extends BaseController {
	static async chat(
		request: Request,
		env: Env,
		_ctx: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<AdvisoryResponseData>>> {
		try {
			const user = context.user;
			if (!user) {
				return AdvisoryController.createErrorResponse<AdvisoryResponseData>('Unauthorized', 401);
			}

			let body: { prompt?: string; history?: AdvisoryTurn[] };
			try {
				body = (await request.json()) as { prompt?: string; history?: AdvisoryTurn[] };
			} catch {
				return AdvisoryController.createErrorResponse<AdvisoryResponseData>('Invalid JSON body', 400);
			}
			const prompt = (body.prompt || '').trim();
			if (!prompt) {
				return AdvisoryController.createErrorResponse<AdvisoryResponseData>('Prompt is required', 400);
			}

			// Resolve the user's model overrides (so the AI quality selector applies here too).
			const modelConfigService = new ModelConfigService(env);
			const userConfigsRecord = await modelConfigService.getUserModelConfigs(user.id);
			const userModelConfigs: Record<string, ModelConfig> = {};
			for (const [actionKey, mergedConfig] of Object.entries(userConfigsRecord)) {
				if (mergedConfig.isUserOverride) {
					const { isUserOverride, userConfigId, ...modelConfig } = mergedConfig;
					userModelConfigs[actionKey] = modelConfig;
				}
			}

			// Usage / balance check before the LLM call.
			const userToken = readTokenCookie(request, env);
			const limitResult = await checkUsageAndBalance(env, user.id, request, userToken);
			if (!limitResult.allowed) {
				return AdvisoryController.createErrorResponse<AdvisoryResponseData>(
					limitResult.reason || 'Usage limit exceeded',
					429,
				);
			}
			const userGateway = userToken ? await getUserGateway(env, user.id) : null;
			const effectiveUserToken = limitResult.refreshedBlob ?? userToken;

			const inferenceContext = {
				metadata: {
					agentId: generateId(),
					userId: user.id,
					shouldUseUserKey: limitResult.shouldUseByok,
					userApiToken: effectiveUserToken,
					userGateway,
				},
				userModelConfigs: userModelConfigs as Record<string, ModelConfig>,
				enableRealtimeCodeFix: false,
				enableFastSmartCodeFix: false,
				shouldUseUserKey: limitResult.shouldUseByok,
				userApiToken: effectiveUserToken,
				userGateway,
			};

			// Build conversation: Daisan + work-mode system context, prior turns, then the prompt.
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

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await executeInference({
				env,
				messages,
				agentActionName: 'conversationalResponse',
				context: inferenceContext as any,
				maxTokens: 6000,
			});

			const text = (result && typeof result === 'object' && 'string' in result)
				? (result.string as string)
				: '';
			return AdvisoryController.createSuccessResponse<AdvisoryResponseData>({
				response: text || 'Xin lỗi, tôi chưa tạo được câu trả lời. Vui lòng thử lại.',
			});
		} catch (error) {
			this.logger.error('Advisory chat error', error);
			return AdvisoryController.handleError(error, 'advisory chat') as ControllerResponse<ApiResponse<AdvisoryResponseData>>;
		}
	}
}
