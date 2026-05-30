import { useEffect, useState } from 'react';
import { Zap, Gauge, Sparkles, ChevronDown, Check, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type QualityPreset = 'fast' | 'balanced' | 'max';

const PRESETS: { id: QualityPreset; label: string; icon: LucideIcon; desc: string }[] = [
	{ id: 'fast', label: 'Fast', icon: Zap, desc: 'Fastest & cheapest — Gemini Flash. Best for quick drafts.' },
	{ id: 'balanced', label: 'Balanced', icon: Gauge, desc: 'Recommended default. Good quality at good speed.' },
	{ id: 'max', label: 'Max quality', icon: Sparkles, desc: 'Best results — Gemini Pro for planning & first build. Slower.' },
];

const STORAGE_KEY = 'daisan.modelQuality';

/**
 * v0-style model/quality selector for the chat composer. Applies a one-click
 * preset to the user's model configs (planning + implementation phases).
 */
export function ModelQualitySelector({ disabled, className }: { disabled?: boolean; className?: string }) {
	const [preset, setPreset] = useState<QualityPreset>('balanced');
	const [applying, setApplying] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY) as QualityPreset | null;
			if (saved === 'fast' || saved === 'balanced' || saved === 'max') setPreset(saved);
		} catch {
			/* ignore */
		}
	}, []);

	const choose = async (next: QualityPreset) => {
		if (next === preset || applying) return;
		const prev = preset;
		setPreset(next);
		setApplying(true);
		try {
			const res = await apiClient.applyModelPreset(next);
			if (res.success) {
				try {
					localStorage.setItem(STORAGE_KEY, next);
				} catch {
					/* ignore */
				}
				const label = PRESETS.find((p) => p.id === next)?.label ?? next;
				toast.success(`AI quality: ${label}`);
			} else {
				setPreset(prev);
				toast.error(res.error?.message || 'Failed to change AI quality');
			}
		} catch {
			setPreset(prev);
			toast.error('Failed to change AI quality');
		} finally {
			setApplying(false);
		}
	};

	const current = PRESETS.find((p) => p.id === preset) ?? PRESETS[1];
	const CurrentIcon = current.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={disabled}>
				<button
					type="button"
					aria-label="AI quality"
					className={cn(
						'inline-flex h-7 items-center gap-1.5 rounded-md border border-border-primary bg-bg-2/60 px-2 text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-60',
						className,
					)}
				>
					{applying ? (
						<Loader2 className="size-3.5 animate-spin text-accent" />
					) : (
						<CurrentIcon className="size-3.5 text-accent" />
					)}
					<span className="hidden sm:inline">{current.label}</span>
					<ChevronDown className="size-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
					AI quality
				</div>
				{PRESETS.map((p) => {
					const Icon = p.icon;
					const active = p.id === preset;
					return (
						<DropdownMenuItem
							key={p.id}
							onSelect={(e) => {
								e.preventDefault();
								choose(p.id);
							}}
							className="flex cursor-pointer items-start gap-2.5 py-2"
						>
							<Icon className={cn('mt-0.5 size-4 shrink-0', active ? 'text-accent' : 'text-text-tertiary')} />
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-1.5">
									<span className="text-sm font-medium text-text-primary">{p.label}</span>
									{active && <Check className="size-3.5 text-accent" />}
								</div>
								<p className="text-xs leading-snug text-text-tertiary">{p.desc}</p>
							</div>
						</DropdownMenuItem>
					);
				})}
				<div className="border-t border-border-primary/60 px-2 py-1.5 text-[11px] text-text-tertiary">
					Applies to planning & build. Tune per-step in Settings.
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
