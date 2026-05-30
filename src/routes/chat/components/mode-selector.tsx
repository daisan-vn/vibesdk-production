import { ClipboardList, Hammer } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ChatMode = 'plan' | 'build';

interface ModeSelectorProps {
	mode: ChatMode;
	onModeChange: (mode: ChatMode) => void;
	disabled?: boolean;
	className?: string;
}

/**
 * Segmented Plan/Build mode selector for the chat input.
 * - Plan: discuss + produce an implementation plan, nothing is changed.
 * - Build: let the AI apply changes to the project.
 * Keyboard: Alt+P -> Plan, Alt+B -> Build (wired by the parent).
 */
export function ModeSelector({
	mode,
	onModeChange,
	disabled,
	className,
}: ModeSelectorProps) {
	return (
		<ToggleGroup
			type="single"
			value={mode}
			onValueChange={(value) => {
				if (value === 'plan' || value === 'build') onModeChange(value);
			}}
			disabled={disabled}
			className={cn(
				'h-7 gap-0 rounded-md border border-border-primary bg-bg-2/60 p-0.5',
				className,
			)}
			aria-label="Chat mode"
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<ToggleGroupItem
						value="plan"
						aria-label="Plan mode"
						className={cn(
							'h-6 gap-1 rounded px-2 text-xs text-text-tertiary',
							'data-[state=on]:bg-accent data-[state=on]:text-white',
						)}
					>
						<ClipboardList className="size-3.5" strokeWidth={2} />
						<span className="hidden sm:inline">Plan</span>
					</ToggleGroupItem>
				</TooltipTrigger>
				<TooltipContent side="top">
					Discuss scope and implementation before changing anything. (Alt+P)
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<ToggleGroupItem
						value="build"
						aria-label="Build mode"
						className={cn(
							'h-6 gap-1 rounded px-2 text-xs text-text-tertiary',
							'data-[state=on]:bg-accent data-[state=on]:text-white',
						)}
					>
						<Hammer className="size-3.5" strokeWidth={2} />
						<span className="hidden sm:inline">Build</span>
					</ToggleGroupItem>
				</TooltipTrigger>
				<TooltipContent side="top">
					Let AI apply changes to your project. (Alt+B)
				</TooltipContent>
			</Tooltip>
		</ToggleGroup>
	);
}
