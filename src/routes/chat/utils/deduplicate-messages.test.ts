import { describe, it, expect } from 'vitest';
import { deduplicateMessages } from './deduplicate-messages';
import type { ChatMessage } from './message-helpers';

const asst = (conversationId: string, content: string, toolNames: string[] = []): ChatMessage => ({
    role: 'assistant',
    conversationId,
    content,
    ui: toolNames.length
        ? { toolEvents: toolNames.map((name) => ({ name, status: 'success' as const, timestamp: 0 })) }
        : undefined,
});
const user = (content: string): ChatMessage => ({ role: 'user', conversationId: `u-${content}`, content });

describe('deduplicateMessages', () => {
    it('collapses an identical reply split across a tool call, preserving the tool chip', () => {
        const msgs: ChatMessage[] = [
            user('redesign homepage'),
            asst('a', 'Mình sẽ nâng cấp giao diện trang chủ.'), // streamed reply
            asst('b', 'Mình sẽ nâng cấp giao diện trang chủ.', ['queue_request']), // post-tool duplicate
        ];
        const out = deduplicateMessages(msgs);
        const assistants = out.filter((m) => m.role === 'assistant');
        expect(assistants).toHaveLength(1);
        // The kept message must carry the tool event from the dropped duplicate.
        expect(assistants[0].ui?.toolEvents?.map((t) => t.name)).toContain('queue_request');
    });

    it('keeps distinct assistant messages', () => {
        const out = deduplicateMessages([asst('a', 'one'), asst('b', 'two')]);
        expect(out).toHaveLength(2);
    });

    it('does not collapse empty-content placeholders', () => {
        const out = deduplicateMessages([asst('a', '', ['x']), asst('b', '', ['y'])]);
        expect(out).toHaveLength(2);
    });

    it('keeps the user message that sits between duplicate replies', () => {
        const out = deduplicateMessages([asst('a', 'hi'), user('q'), asst('b', 'hi')]);
        expect(out.filter((m) => m.role === 'assistant')).toHaveLength(1);
        expect(out.filter((m) => m.role === 'user')).toHaveLength(1);
    });
});
