/**
 * Intake clarification analysis (flag-gated, fail-safe).
 *
 * Before committing to a full build, decide whether the user's request is
 * missing CRITICAL information. If so, return 1-3 short questions to ask instead
 * of building the wrong thing. Designed to NEVER block a build: any error or
 * ambiguity resolves to "no clarification needed" so generation proceeds.
 */
import { z } from 'zod';
import { executeInference } from '../inferutils/infer';
import { createSystemMessage, createUserMessage } from '../inferutils/common';
import type { InferenceContext } from '../inferutils/config.types';

const ClarifySchema = z.object({
	needsClarification: z.boolean(),
	questions: z.array(z.string()).max(3).default([]),
});

export interface ClarifyResult {
	needsClarification: boolean;
	questions: string[];
}

// Requests this detailed (in words) are assumed clear enough — skip the LLM call.
const WORD_THRESHOLD = 14;

export async function analyzeForClarification(params: {
	env: Env;
	inferenceContext: InferenceContext;
	query: string;
	projectType?: string;
}): Promise<ClarifyResult> {
	const { env, inferenceContext, query } = params;
	try {
		const words = query.trim().split(/\s+/).filter(Boolean).length;
		if (words >= WORD_THRESHOLD) {
			return { needsClarification: false, questions: [] };
		}

		const system = createSystemMessage(
			`You are Daisan AI's intake analyst for a website/app builder serving a Vietnamese building-materials / ceramic-tile / commerce company (DaisanStore).
Decide whether the user's request is missing CRITICAL information needed to build the RIGHT app — e.g. product/app type, the key pages, real vs mock data, brand/theme, language, or target users.
Rules:
- If the request is reasonably clear, return needsClarification=false with an empty questions array. Prefer to proceed.
- Only if important information is genuinely missing, return needsClarification=true with 1-3 SHORT, specific, friendly questions in Vietnamese. Never more than 3. Never ask trivial or generic questions.`,
		);
		const user = createUserMessage(`User request: "${query}"`);

		const { object } = await executeInference({
			env,
			messages: [system, user],
			agentActionName: 'conversationalResponse',
			schema: ClarifySchema,
			context: inferenceContext,
			retryLimit: 1,
		});

		if (!object) return { needsClarification: false, questions: [] };
		const questions = (object.questions ?? [])
			.filter((q) => typeof q === 'string' && q.trim().length > 0)
			.slice(0, 3);
		return {
			needsClarification: Boolean(object.needsClarification) && questions.length > 0,
			questions,
		};
	} catch {
		// Fail-safe: never block a build on a clarification failure.
		return { needsClarification: false, questions: [] };
	}
}
