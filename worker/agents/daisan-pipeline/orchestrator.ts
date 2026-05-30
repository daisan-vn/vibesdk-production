/**
 * Daisan specialist orchestrator (P2/P3).
 *
 * Strangler-fig realization of the 12-agent architecture on top of the existing
 * VibeSDK engine: instead of replacing the pipeline, it runs the THREE missing
 * specialist agents (Database / Search / Content) conditionally, in parallel,
 * and aggregates their short design briefs. The blueprint step then incorporates
 * the brief so generated apps get specialist-level data/search/content design.
 *
 * SAFETY:
 *  - Flag-gated: only runs when env.DAISAN_SPECIALISTS_ENABLED === 'true' (default OFF).
 *  - Conditional: each specialist only runs when the request matches its domain.
 *  - Best-effort: a specialist failure is skipped; never breaks generation.
 */

import { executeInference } from '../inferutils/infer';
import { createSystemMessage, createUserMessage } from '../inferutils/common';
import { AIModels } from '../inferutils/config.types';
import { createLogger } from '../../logger';
import { SPECIALISTS, type Specialist } from './agents/specialists';

const logger = createLogger('DaisanSpecialistOrchestrator');

function isEnabled(env: Env): boolean {
	const flag = (env as unknown as Record<string, string | undefined>).DAISAN_SPECIALISTS_ENABLED;
	return flag === 'true';
}

async function runOne(
	specialist: Specialist,
	query: string,
	env: Env,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	inferenceContext: any,
): Promise<{ title: string; text: string } | null> {
	try {
		const result = await executeInference({
			env,
			messages: [createSystemMessage(specialist.systemPrompt), createUserMessage(`YÊU CẦU: "${query}"`)],
			agentActionName: 'conversationalResponse',
			context: inferenceContext,
			modelName: AIModels.GEMINI_3_FLASH_PREVIEW,
			maxTokens: 1200,
			temperature: 0.4,
			// best-effort: do NOT throw — a failed specialist is simply skipped.
			throwOnExhaustion: false,
			// Fail FAST: never let a specialist's retry/backoff (e.g. on 429) stall the
			// whole generation and trigger a WebSocket disconnect. One attempt only.
			retryLimit: 1,
		});
		const text = result && typeof result === 'object' && 'string' in result ? (result.string as string).trim() : '';
		return text ? { title: specialist.title, text } : null;
	} catch (e) {
		logger.warn(`Specialist ${specialist.id} failed (skipped)`, { error: e });
		return null;
	}
}

/**
 * Run the relevant specialists for a request and return an aggregated brief
 * (or '' when disabled / none relevant / all failed). Safe to call unconditionally.
 */
export async function runSpecialistBrief(
	query: string,
	env: Env,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	inferenceContext: any,
): Promise<string> {
	if (!isEnabled(env) || !query?.trim()) return '';

	const needed = SPECIALISTS.filter((s) => s.shouldRun(query));
	if (needed.length === 0) return '';

	logger.info('Running Daisan specialists', { specialists: needed.map((s) => s.id) });

	// Hard timeout: specialists must NEVER delay generation enough to drop the
	// WebSocket. If they don't finish in time, skip them and proceed to blueprint.
	const SPECIALIST_TIMEOUT_MS = 12000;
	const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), SPECIALIST_TIMEOUT_MS));
	const work = Promise.all(needed.map((s) => runOne(s, query, env, inferenceContext)));
	const raced = await Promise.race([work, timeout]);
	if (raced === null) {
		logger.warn('Specialists timed out — proceeding to blueprint without their brief');
		return '';
	}
	const sections = raced.filter((r): r is { title: string; text: string } => !!r);
	if (sections.length === 0) return '';

	const body = sections.map((s) => `## ${s.title}\n${s.text}`).join('\n\n');
	return `<DAISAN_SPECIALIST_DESIGN>\nCác chuyên gia Daisan đã phác thảo thiết kế dưới đây — hãy TÍCH HỢP vào blueprint/app (data model, search, nội dung/SEO) cho phù hợp:\n\n${body}\n</DAISAN_SPECIALIST_DESIGN>`;
}
