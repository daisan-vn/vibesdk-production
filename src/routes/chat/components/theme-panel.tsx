import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ThemeValues {
	primary: string;
	accent: string;
	appearance: 'light' | 'dark';
	font: string;
}

const FONTS = ['Inter', 'Geist', 'Poppins', 'Roboto', 'Sora', 'system-ui'];

const PRESETS: { name: string; values: ThemeValues }[] = [
	{ name: 'Minimal', values: { primary: '#111827', accent: '#6366f1', appearance: 'light', font: 'Inter' } },
	{ name: 'Vibrant', values: { primary: '#7c3aed', accent: '#f59e0b', appearance: 'light', font: 'Poppins' } },
	{ name: 'Dark Pro', values: { primary: '#22d3ee', accent: '#a78bfa', appearance: 'dark', font: 'Geist' } },
	{ name: 'Daisan', values: { primary: '#ff3d00', accent: '#1f2937', appearance: 'dark', font: 'Inter' } },
];

function buildThemeInstruction(v: ThemeValues): string {
	return [
		"Update ONLY the app's visual theme / design tokens. Do not change any",
		'functionality, routes, data, or component structure — only colors,',
		'typography and appearance:',
		`- Primary color: ${v.primary}`,
		`- Accent color: ${v.accent}`,
		`- Appearance: ${v.appearance} mode`,
		`- Font family: ${v.font}`,
		'Apply these consistently in tailwind.config and the global CSS',
		'(:root CSS variables), keeping the existing layout and content intact.',
	].join('\n');
}

interface ThemePanelProps {
	onApply: (instruction: string, summary: string) => void;
	disabled?: boolean;
}

/**
 * Lightweight Themes panel. Lets the user pick colors / appearance / font and
 * applies them via the existing Build-mode pipeline (robust across any app),
 * so there is no new backend surface.
 */
export function ThemePanel({ onApply, disabled }: ThemePanelProps) {
	const [open, setOpen] = useState(false);
	const [theme, setTheme] = useState<ThemeValues>(PRESETS[3].values);

	const apply = () => {
		const summary = `🎨 Theme: ${theme.primary} / ${theme.accent} · ${theme.appearance} · ${theme.font}`;
		onApply(buildThemeInstruction(theme), summary);
		setOpen(false);
	};

	const set = (patch: Partial<ThemeValues>) => setTheme((t) => ({ ...t, ...patch }));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					className="h-7 gap-1.5 border-border-primary bg-bg-2/60 text-xs text-text-tertiary hover:text-text-primary"
					title="Edit theme (colors, typography)"
				>
					<Palette className="size-3.5" strokeWidth={2} />
					<span className="hidden sm:inline">Theme</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-72 border-border-primary bg-bg-1 p-4">
				<div className="space-y-4">
					<div>
						<p className="text-sm font-medium text-text-primary">Theme</p>
						<p className="text-xs text-text-tertiary">Colors & typography — applied in Build mode.</p>
					</div>

					<div className="grid grid-cols-4 gap-1.5">
						{PRESETS.map((p) => (
							<button
								key={p.name}
								type="button"
								onClick={() => setTheme(p.values)}
								className={cn(
									'rounded-md border px-1 py-1.5 text-[11px] transition-colors',
									theme.primary === p.values.primary && theme.accent === p.values.accent
										? 'border-accent text-text-primary'
										: 'border-border-primary text-text-tertiary hover:text-text-primary',
								)}
							>
								<span
									className="mx-auto mb-1 block size-3 rounded-full"
									style={{ background: p.values.primary }}
								/>
								{p.name}
							</button>
						))}
					</div>

					<div className="flex items-center justify-between">
						<Label className="text-xs text-text-secondary">Primary</Label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={theme.primary}
								onChange={(e) => set({ primary: e.target.value })}
								className="size-6 cursor-pointer rounded border border-border-primary bg-transparent"
							/>
							<span className="w-16 text-right font-mono text-xs text-text-tertiary">{theme.primary}</span>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<Label className="text-xs text-text-secondary">Accent</Label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={theme.accent}
								onChange={(e) => set({ accent: e.target.value })}
								className="size-6 cursor-pointer rounded border border-border-primary bg-transparent"
							/>
							<span className="w-16 text-right font-mono text-xs text-text-tertiary">{theme.accent}</span>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<Label className="text-xs text-text-secondary">Appearance</Label>
						<Select value={theme.appearance} onValueChange={(v) => set({ appearance: v as 'light' | 'dark' })}>
							<SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="light">Light</SelectItem>
								<SelectItem value="dark">Dark</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between">
						<Label className="text-xs text-text-secondary">Font</Label>
						<Select value={theme.font} onValueChange={(v) => set({ font: v })}>
							<SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
							<SelectContent>
								{FONTS.map((f) => (
									<SelectItem key={f} value={f}>{f}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button type="button" size="sm" onClick={apply} className="w-full gap-1.5">
						<Check className="size-3.5" /> Apply theme
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
