import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseFollowupSuggestionsArgs {
	chatId: string | undefined;
	/** True while a build/turn is active. Chips clear on start, fetch on finish. */
	busy: boolean;
	/** True once there is a project/blueprint to suggest against. */
	ready: boolean;
}

/**
 * Fetches Lovable-style follow-up suggestions right after a build/turn finishes
 * (a busy true -> false transition). Chips are cleared the moment new work starts.
 */
export function useFollowupSuggestions({ chatId, busy, ready }: UseFollowupSuggestionsArgs) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const prevBusyRef = useRef(busy);

	useEffect(() => {
		const wasBusy = prevBusyRef.current;
		prevBusyRef.current = busy;

		if (busy) {
			// Work started — hide stale chips.
			setSuggestions([]);
			return;
		}

		// Only fetch right after a turn finishes (busy: true -> false) for a live project.
		if (!wasBusy || !ready || !chatId) {
			return;
		}

		let cancelled = false;
		apiClient.getFollowupSuggestions(chatId).then((list) => {
			if (!cancelled) {
				setSuggestions(list);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [busy, ready, chatId]);

	return {
		suggestions,
		dismiss: () => setSuggestions([]),
	};
}
