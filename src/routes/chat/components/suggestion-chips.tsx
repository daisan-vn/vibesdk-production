import { Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
	suggestions: string[];
	onSelect: (suggestion: string) => void;
	disabled?: boolean;
}

/**
 * Lovable-style follow-up suggestion chips, rendered just above the chat composer.
 * Clicking a chip sends it as the next instruction. Renders nothing when empty.
 */
export function SuggestionChips({ suggestions, onSelect, disabled = false }: SuggestionChipsProps) {
	if (suggestions.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-2 px-4 pb-2">
			{suggestions.map((suggestion, index) => (
				<button
					key={`${index}-${suggestion}`}
					type="button"
					disabled={disabled}
					onClick={() => onSelect(suggestion)}
					title={suggestion}
					className="group inline-flex items-center gap-1.5 rounded-full border border-[#f48120]/30 bg-bg-2 px-3 py-1.5 text-xs text-text-primary/80 transition-colors hover:border-[#f48120]/70 hover:bg-accent/10 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Sparkles className="size-3 shrink-0 text-[#f48120]" />
					<span className="max-w-[260px] truncate">{suggestion}</span>
				</button>
			))}
		</div>
	);
}
