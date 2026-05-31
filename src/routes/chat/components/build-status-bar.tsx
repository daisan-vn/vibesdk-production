import { Loader2, CheckCircle2, AlertTriangle, Square, RotateCcw, ExternalLink, Sparkles, Wifi } from 'lucide-react';
import type { BuildJobState } from '@/api-types';

interface BuildStatusBarProps {
	state: BuildJobState;
	lastError?: string;
	progress: number;
	total: number;
	previewUrl?: string;
	isReconnecting?: boolean;
	onStop?: () => void;
	onRetry?: () => void;
	onOpenPreview?: () => void;
}

type Tone = 'running' | 'ok' | 'error' | 'idle' | 'warn';

const RUNNING: ReadonlySet<BuildJobState> = new Set([
	'analyzing', 'planning', 'blueprint_ready', 'generating_code', 'installing_dependencies', 'preview_starting',
]);

function describe(state: BuildJobState): { label: string; tone: Tone } {
	switch (state) {
		case 'queued': return { label: 'Queued', tone: 'idle' };
		case 'analyzing': return { label: 'Analyzing request...', tone: 'running' };
		case 'needs_clarification': return { label: 'Daisan needs a quick answer - see the question above', tone: 'warn' };
		case 'awaiting_approval': return { label: 'Plan ready - waiting for your approval to build', tone: 'idle' };
		case 'planning': return { label: 'Planning...', tone: 'running' };
		case 'blueprint_ready': return { label: 'Blueprint ready - building', tone: 'running' };
		case 'generating_code': return { label: 'Generating code', tone: 'running' };
		case 'installing_dependencies': return { label: 'Installing dependencies...', tone: 'running' };
		case 'preview_starting': return { label: 'Preparing preview...', tone: 'running' };
		case 'preview_ready': return { label: 'Preview ready', tone: 'ok' };
		case 'deployable': return { label: 'Build complete - ready to deploy', tone: 'ok' };
		case 'done': return { label: 'Done', tone: 'ok' };
		case 'failed': return { label: 'Build failed', tone: 'error' };
		case 'aborted': return { label: 'Generation stopped', tone: 'warn' };
		case 'reconnecting': return { label: 'Reconnecting...', tone: 'warn' };
		default: return { label: 'Working...', tone: 'running' };
	}
}

const TONE_STYLES: Record<Tone, string> = {
	running: 'border-[#ff5a1f]/25 bg-[#ff5a1f]/10 text-[#ff7a45]',
	ok: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
	error: 'border-red-500/25 bg-red-500/10 text-red-400',
	warn: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
	idle: 'border-white/10 bg-white/5 text-text-secondary',
};

/**
 * Compact, always-visible canonical build status - turns the opaque
 * "Thinking... -> Done" into a transparent, per-state line driven by the
 * server build-job state machine, with the right contextual action.
 */
export function BuildStatusBar({
	state,
	lastError,
	progress,
	total,
	previewUrl,
	isReconnecting,
	onStop,
	onRetry,
	onOpenPreview,
}: BuildStatusBarProps) {
	// Reconnecting overrides the displayed state (server state may be stale).
	const effective = isReconnecting ? 'reconnecting' : state;
	const { label, tone } = describe(effective);
	const isRunning = RUNNING.has(effective);
	const showPhaseCount = effective === 'generating_code' && total > 0;

	const Icon = tone === 'ok' ? CheckCircle2
		: tone === 'error' ? AlertTriangle
		: tone === 'warn' ? (effective === 'reconnecting' ? Wifi : AlertTriangle)
		: isRunning ? (effective === 'analyzing' ? Sparkles : Loader2)
		: Sparkles;
	const spin = isRunning && effective !== 'analyzing' && !isReconnecting;

	return (
		<div
			className={`mx-4 mt-3 flex items-center gap-2.5 rounded-[14px] border px-3 py-2 ${TONE_STYLES[tone]}`}
		>
			<Icon className={`size-4 shrink-0 ${spin ? 'animate-spin' : effective === 'analyzing' || (isReconnecting) ? 'animate-pulse' : ''}`} />
			<div className="min-w-0 flex-1">
				<div className="truncate text-sm font-medium">
					{label}
					{showPhaseCount && (
						<span className="ml-1.5 font-normal opacity-80"> - {progress}/{total} phases</span>
					)}
				</div>
				{effective === 'failed' && lastError && (
					<div className="truncate text-xs opacity-80">{lastError}</div>
				)}
			</div>

			{/* Contextual action */}
			{isRunning && onStop && (
				<button
					type="button"
					onClick={onStop}
					title="Stop generation"
					aria-label="Stop generation"
					className="touch-target flex size-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25"
				>
					<Square className="size-3.5 fill-current" />
				</button>
			)}
			{effective === 'failed' && onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff5a1f] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#ff5a1f]/90"
				>
					<RotateCcw className="size-3.5" /> Retry
				</button>
			)}
			{(effective === 'preview_ready' || effective === 'deployable' || effective === 'done') && previewUrl && onOpenPreview && (
				<button
					type="button"
					onClick={onOpenPreview}
					className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-white/10"
				>
					<ExternalLink className="size-3.5" /> Open preview
				</button>
			)}
		</div>
	);
}
