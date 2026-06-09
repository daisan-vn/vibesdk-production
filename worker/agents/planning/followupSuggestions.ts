import { executeInference } from '../inferutils/infer';
import { createSystemMessage, createUserMessage } from '../inferutils/common';
import { InferenceContext } from '../inferutils/config.types';
import { createLogger } from '../../logger';
import z from 'zod';

const logger = createLogger('FollowupSuggestions');

const FollowupSuggestionsSchema = z.object({
    suggestions: z
        .array(z.string())
        .describe('Exactly 3 short, actionable next-step suggestions the user could click to send next'),
});

const SYSTEM_PROMPT = `You are a product copilot for a Lovable-style AI web app builder. Given the app being built and what was just done, propose the user's most likely NEXT requests.

RULES:
- Output EXACTLY 3 suggestions.
- Each is a short imperative phrase (3-8 words) the user could click to send as their next instruction.
- Make them concrete and specific to THIS app and what was just built - never generic like "improve the UI".
- Vary them: e.g. one new feature, one polish/UX refinement, one data/logic improvement.
- Write in the SAME language as the user's request (Vietnamese if the request is Vietnamese).
- No numbering, no surrounding quotes, no trailing punctuation.`;

export interface FollowupSuggestionsArgs {
    env: Env;
    inferenceContext: InferenceContext;
    projectName: string;
    description: string;
    query: string;
    filePaths: string[];
    recentUpdates: string[];
}

/**
 * Generate up to 3 context-aware "what to do next" suggestions for the chat composer.
 * Uses the cheap conversational model. Best-effort: returns [] on any failure so the
 * UI simply hides the chips.
 */
export async function generateFollowupSuggestions(args: FollowupSuggestionsArgs): Promise<string[]> {
    const { env, inferenceContext, projectName, description, query, filePaths, recentUpdates } = args;
    try {
        const recent = recentUpdates.slice(-5).join('\n').trim() || 'Initial build just completed.';
        const userMessage = createUserMessage(
            `APP: ${projectName || 'Untitled app'}
WHAT IT DOES: ${description || query}
ORIGINAL REQUEST: ${query}
FILES (${filePaths.length}): ${filePaths.slice(0, 40).join(', ')}
RECENTLY DONE:
${recent}

Propose the 3 best next requests.`,
        );

        const { object } = await executeInference({
            env,
            messages: [createSystemMessage(SYSTEM_PROMPT), userMessage],
            agentActionName: 'conversationalResponse',
            schema: FollowupSuggestionsSchema,
            context: inferenceContext,
        });

        return (object?.suggestions ?? [])
            .map((suggestion) => suggestion.trim())
            .filter((suggestion) => suggestion.length > 0)
            .slice(0, 3);
    } catch (error) {
        logger.warn('Failed to generate follow-up suggestions', error);
        return [];
    }
}
