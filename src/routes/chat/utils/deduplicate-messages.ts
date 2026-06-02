import type { ChatMessage } from './message-helpers';

/**
 * Deduplicates consecutive assistant messages with identical content.
 * 
 * This handles cases where the backend sends duplicate responses after tool execution,
 * even when tool messages appear between them.
 * 
 * Algorithm:
 * - Keeps all non-assistant messages
 * - For each assistant message, checks if the last assistant (not necessarily adjacent) has identical content
 * - If duplicate found, skips the current message
 * 
 * @param messages - Array of chat messages to deduplicate
 * @returns Deduplicated array of messages
 */
export function deduplicateMessages(messages: readonly ChatMessage[]): ChatMessage[] {
    if (messages.length === 0) return [];

    const result: ChatMessage[] = [];
    let lastAssistantContent: string | null = null;
    let lastAssistantIdx = -1;

    for (const msg of messages) {
        if (msg.role !== 'assistant') {
            // Keep all non-assistant messages (user, tool, etc.)
            result.push(msg);
            continue;
        }

        // Duplicate = same NON-EMPTY text as the previous assistant message. This happens
        // when the streamed reply and the post-tool reply arrive under different
        // conversationIds, leaving two identical bubbles with a tool chip between them.
        // Skip the duplicate, but carry over any tool events it held so the tool chip
        // (e.g. queue_request) is preserved on the message we keep.
        // `content` is typed as string but can be undefined / non-string at runtime
        // (placeholders, multimodal, restored history). Normalize before any string op
        // so a stray value can never throw during render (which crashes the whole route).
        const content = typeof msg.content === 'string' ? msg.content : '';
        if (
            lastAssistantContent !== null &&
            content === lastAssistantContent &&
            content.trim() !== '' &&
            lastAssistantIdx !== -1
        ) {
            const incoming = msg.ui?.toolEvents;
            if (incoming && incoming.length > 0) {
                const kept = result[lastAssistantIdx];
                result[lastAssistantIdx] = {
                    ...kept,
                    ui: { ...kept.ui, toolEvents: [...(kept.ui?.toolEvents ?? []), ...incoming] },
                };
            }
            continue;
        }

        // Not a duplicate - keep it and remember it as the comparison anchor.
        result.push(msg);
        lastAssistantIdx = result.length - 1;
        lastAssistantContent = content;
    }

    return result;
}

/**
 * Check if a new assistant message would be a duplicate of the last assistant message.
 * Used for live streaming to prevent adding duplicates.
 * 
 * @param messages - Current messages array
 * @param newContent - Content of the new assistant message
 * @returns true if this would be a duplicate, false otherwise
 */
export function isAssistantMessageDuplicate(
    messages: readonly ChatMessage[],
    newContent: string
): boolean {
    // Find the last assistant message
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            return messages[i].content === newContent;
        }
    }
    return false; // No previous assistant message found
}
