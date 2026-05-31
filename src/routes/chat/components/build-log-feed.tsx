import { useMemo, useState } from 'react';
import { FileText, Terminal, CheckCircle2, Loader2, AlertCircle, Circle, XCircle } from 'lucide-react';
import type { PhaseTimelineItem } from '../hooks/use-chat';

type EntryStatus = 'generating' | 'completed' | 'error' | 'validating' | 'cancelled';

interface LogEntry {
	key: string;
	kind: 'phase' | 'file';
	status: EntryStatus;
	summary: string;
	technical: string;
}

interface BuildLogFeedProps {
	phaseTimeline: PhaseTimelineItem[];
}

const basename = (p: string) => p.split('/').filter(Boolean).pop() || p;

function phaseSummary(name: string, status: EntryStatus): string {
	switch (status) {
		case 'completed': return `Completed: ${name}`;
		case 'validating': return `Reviewing: ${name}`;
		case 'error': return `Error in: ${name}`;
		case 'cancelled': return `Cancelled: ${name}`;
		default: return `Building: ${name}`;
	}
}

function fileSummary(path: string, status: EntryStatus): string {
	const b = basename(path);
	switch (status) {
		case 'completed': return `Wrote ${b}`;
		case 'validating': return `Checking ${b}`;
		case 'error': return `Issue in ${b}`;
		case 'cancelled': return `Skipped ${b}`;
		default: return `Writing ${b}`;
	}
}

function StatusDot({ status }: { status: EntryStatus }) {
	if (status === 'completed') return <CheckCircle2 className="size-3.5 text-emerald-400" />;
	if (status === 'error') return <AlertCircle className="size-3.5 text-red-400" />;
	if (status === 'cancelled') return <XCircle className="size-3.5 text-text-tertiary" />;
	if (status === 'validating') return <Loader2 className="size-3.5 animate-spin text-blue-400" />;
	if (status === 'generating') return <Loader2 className="size-3.5 animate-spin text-[#ff7a45]" />;
	return <Circle className="size-3.5 text-text-tertiary" />;
}

/**
 * Readable, streaming build activity with a Summary / Technical toggle.
 * Derived from the existing phase timeline (no backend changes). Summary is the
 * default so non-technical users can follow along; Technical shows file paths.
 */
export function BuildLogFeed({ phaseTimeline }: BuildLogFeedProps) {
	const [mode, setMode] = useState<'summary' | 'technical'>('summary');

	const entries = useMemo<LogEntry[]>(() => {
		const out: LogEntry[] = [];
		phaseTimeline.forEach((phase, pi) => {
			out.push({
				key: `p${pi}`,
				kind: 'phase',
				status: phase.status,
				summary: phaseSummary(phase.name, phase.status),
				technical: phase.name,
			});
			(phase.files || []).forEach((f, fi) => {
				out.push({
					key: `p${pi}f${fi}`,
					kind: 'file',
					status: f.status,
					summary: fileSummary(f.path, f.status),
					technical: f.path,
				});
			});
		});
		return out;
	}, [phaseTimeline]);

	if (entries.length === 0) return null;

	return (
		<div className="rounded-2xl border border-white/10 bg-[#202020]">
			<div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
				<span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Activity</span>
				<div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
					<button
						type="button"
						onClick={() => setMode('summary')}
						className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
							mode === 'summary' ? 'bg-[#ff5a1f] text-white' : 'text-text-secondary hover:text-text-primary'
						}`}
					>
						<FileText className="size-3" /> Summary
					</button>
					<button
						type="button"
						onClick={() => setMode('technical')}
						className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
							mode === 'technical' ? 'bg-[#ff5a1f] text-white' : 'text-text-secondary hover:text-text-primary'
						}`}
					>
						<Terminal className="size-3" /> Technical
					</button>
				</div>
			</div>

			<div className="max-h-[240px] overflow-y-auto px-3 py-2 no-scrollbar">
				<ul className="space-y-1">
					{entries.map((e) => (
						<li key={e.key} className="flex items-start gap-2">
							<span className="mt-0.5 shrink-0">
								<StatusDot status={e.status} />
							</span>
							{mode === 'summary' ? (
								<span
									className={`text-xs leading-relaxed ${
										e.kind === 'phase' ? 'font-medium text-text-primary' : 'text-text-secondary'
									}`}
								>
									{e.summary}
								</span>
							) : (
								<span className="break-all font-mono text-[11px] leading-relaxed text-text-secondary">
									{e.technical}
								</span>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
