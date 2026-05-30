import { useEffect, useState } from 'react';
import { Zap, Gauge, Sparkles, ChevronDown, Check, Loader2, Boxes } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type QualityPreset = 'fast' | 'balanced' | 'max' | 'custom';

const PRESETS: { id: Exclude<QualityPreset, 'custom'>; label: string; icon: LucideIcon; desc: string }[] = [
	{ id: 'fast', label: 'Fast', icon: Zap, desc: 'Fastest & cheapest — Gemini Flash. Quick drafts.' },
	{ id: 'balanced', label: 'Balanced', icon: Gauge, desc: 'Recommended default. Good quality at good speed.' },
	{ id: 'max', label: 'Max quality', icon: Sparkles, desc: 'Best results — Claude 4.5 Sonnet for planning & build. Slower.' },
];

// Curated specific models for "More models" (applied to planning + build phases).
const MORE_MODELS: { id: string; name: string; hint: string }[] = [
	{ id: 'anthropic/claude-sonnet-4-5', name: 'Claude 4.5 Sonnet', hint: 'Best for coding' },
	{ id: 'anthropic/claude-opus-4-5', name: 'Claude 4.5 Opus', hint: 'Most capable' },
	{ id: 'google-ai-studio/gemini-3-pro-preview', name: 'Gemini 3 Pro', hint: 'Strong reasoning' },
	{ id: 'google-ai-studio/gemini-3-flash-preview', name: 'Gemini 3 Flash', hint: 'Fast & cheap' },
	{ id: 'openai/gpt-5.2', name: 'GPT-5.2', hint: 'OpenAI flagship' },
];

const KEY_PRESET = 'daisan.modelQuality';
const KEY_MODEL = 'daisan.modelQuality.model';

export function ModelQualitySelector({ disabled, className }: { disabled?: boolean; className?: string }) {
	const [preset, setPreset] = useState<QualityPreset>('balanced');
	const [customModel, setCustomModel] = useState<string | null>(null);
	const [applying, setApplying] = useState(false);

	useEffect(() => {
		try {
			const savedPreset = localStorage.getItem(KEY_PRESET) as QualityPreset | null;
			if (savedPreset && ['fast', 'balanced', 'max', 'custom'].includes(savedPreset)) setPreset(savedPreset);
			const savedModel = localStorage.getItem(KEY_MODEL);
			if (savedModel) setCustomModel(savedModel);
		} catch {
			/* ignore */
		}
	}, []);

	const apply = async (next: QualityPreset, model?: string, label?: string) => {
		if (applying) return;
		const prevPreset = preset;
		const prevModel = customModel;
		setPreset(next);
		setCustomModel(next === 'custom' ? model ?? null : null);
		setApplying(true);
		try {
			const res = await apiClient.applyModelPreset(next, model);
			if (res.success) {
				try {
					localStorage.setItem(KEY_PRESET, next);
					if (next === 'custom' && model) localStorage.setItem(KEY_MODEL, model);
					else localStorage.removeItem(KEY_MODEL);
				} catch {
					/* ignore */
				}
				toast.success(`AI: ${label ?? next}`);
			} else {
				setPreset(prevPreset);
				setCustomModel(prevModel);
				toast.error(res.error?.message || 'Failed to change AI model');
			}
		} catch {
			setPreset(prevPreset);
			setCustomModel(prevModel);
			toast.error('Failed to change AI model');
		} finally {
			setApplying(false);
		}
	};

	const currentPreset = PRESETS.find((p) => p.id === preset);
	const currentModel = MORE_MODELS.find((m) => m.id === customModel);
	const triggerLabel =
		preset === 'custom' ? currentModel?.name ?? 'Custom model' : currentPreset?.label ?? 'Balanced';
	const TriggerIcon = preset === 'custom' ? Boxes : currentPreset?.icon ?? Gauge;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={disabled}>
				<button
					type="button"
					aria-label="AI model"
					className={cn(
						'inline-flex h-7 items-center gap-1.5 rounded-md border border-border-primary bg-bg-2/60 px-2 text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-60',
						className,
					)}
				>
					{applying ? (
						<Loader2 className="size-3.5 animate-spin text-accent" />
					) : (
						<TriggerIcon className="size-3.5 text-accent" />
					)}
					<span className="hidden max-w-[120px] truncate sm:inline">{triggerLabel}</span>
					<ChevronDown className="size-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
					AI quality
				</div>
				{PRESETS.map((p) => {
					const Icon = p.icon;
					const active = preset === p.id;
					return (
						<DropdownMenuItem
							key={p.id}
							onSelect={(e) => {
								e.preventDefault();
								apply(p.id, undefined, p.label);
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

				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="gap-2.5">
						<Boxes className={cn('size-4', preset === 'custom' ? 'text-accent' : 'text-text-tertiary')} />
						<span className="flex-1 text-sm">More models</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-60">
						<div className="px-2 py-1.5 text-[11px] text-text-tertiary">
							Use a specific model for planning & build
						</div>
						{MORE_MODELS.map((m) => {
							const active = preset === 'custom' && customModel === m.id;
							return (
								<DropdownMenuItem
									key={m.id}
									onSelect={(e) => {
										e.preventDefault();
										apply('custom', m.id, m.name);
									}}
									className="flex cursor-pointer items-center gap-2 py-2"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5">
											<span className="text-sm font-medium text-text-primary">{m.name}</span>
											{active && <Check className="size-3.5 text-accent" />}
										</div>
										<p className="text-xs text-text-tertiary">{m.hint}</p>
									</div>
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<div className="border-t border-border-primary/60 px-2 py-1.5 text-[11px] text-text-tertiary">
					Applies to planning & build. Tune per-step in Settings.
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
