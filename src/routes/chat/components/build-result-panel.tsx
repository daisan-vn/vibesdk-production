import { useState } from 'react';
import {
	CheckCircle2, AlertTriangle, Loader2, Wrench, ChevronDown, ChevronRight,
	FileCode, ExternalLink, Sparkles, FileDiff,
} from 'lucide-react';
import type { FileType, BuildJobState } from '@/api-types';

interface BuildResultPanelProps {
	buildState?: BuildJobState;
	isBuilding: boolean;
	runtimeErrorCount: number;
	staticIssueCount: number;
	files: FileType[];
	previewUrl?: string;
	onOpenFile: (file: FileType) => void;
	onOpenPreview: () => void;
	onEditWithAI: () => void;
	onAutoFix: () => void;
}

const basename = (p: string) => p.split('/').filter(Boolean).pop() || p;

/**
 * Result surface shown once a build has produced files: a Checks summary
 * (passed / issues + Auto-fix) and a Changed-files list (clickable), plus
 * preview / edit actions. Never claims "passed" while still building.
 */
export function BuildResultPanel({
	buildState,
	isBuilding,
	runtimeErrorCount,
	staticIssueCount,
	files,
	previewUrl,
	onOpenFile,
	onOpenPreview,
	onEditWithAI,
	onAutoFix,
}: BuildResultPanelProps) {
	const [filesOpen, setFilesOpen] = useState(false);

	const issues = runtimeErrorCount + staticIssueCount;
	// Checks are only trustworthy once the build settled into a result state.
	const checksKnown =
		!isBuilding &&
		(buildState === 'deployable' || buildState === 'preview_ready' || buildState === 'done' || buildState === 'failed');

	return (
		<div className="space-y-2">
			{/* Checks */}
			<div className="rounded-2xl border border-white/10 bg-[#202020] px-4 py-3">
				<div className="flex items-center gap-2.5">
					{!checksKnown ? (
						<Loader2 className="size-4 shrink-0 animate-spin text-[#ff7a45]" />
					) : issues === 0 ? (
						<CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
					) : (
						<AlertTriangle className="size-4 shrink-0 text-amber-400" />
					)}
					<div className="min-w-0 flex-1">
						<div className="text-sm font-medium text-text-primary">
							{!checksKnown
								? 'Running checks…'
								: issues === 0
									? 'Checks passed'
									: `Build finished with ${issues} issue${issues > 1 ? 's' : ''}`}
						</div>
						{checksKnown && issues > 0 && (
							<div className="text-xs text-text-tertiary">
								{runtimeErrorCount > 0 && <span className="text-red-400/90">{runtimeErrorCount} runtime error{runtimeErrorCount > 1 ? 's' : ''}</span>}
								{runtimeErrorCount > 0 && staticIssueCount > 0 && ' · '}
								{staticIssueCount > 0 && <span className="text-amber-400/90">{staticIssueCount} warning{staticIssueCount > 1 ? 's' : ''}</span>}
							</div>
						)}
					</div>
					{checksKnown && issues > 0 && (
						<button
							type="button"
							onClick={onAutoFix}
							className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-[#ff5a1f] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#ff5a1f]/90"
						>
							<Wrench className="size-3.5" /> Auto-fix
						</button>
					)}
				</div>
			</div>

			{/* Changed files */}
			{files.length > 0 && (
				<div className="rounded-2xl border border-white/10 bg-[#202020]">
					<button
						type="button"
						onClick={() => setFilesOpen((v) => !v)}
						className="flex w-full items-center gap-2 px-4 py-3 text-left"
					>
						{filesOpen ? <ChevronDown className="size-4 text-text-tertiary" /> : <ChevronRight className="size-4 text-text-tertiary" />}
						<FileDiff className="size-4 text-text-secondary" />
						<span className="text-sm font-medium text-text-primary">Changed files</span>
						<span className="text-xs text-text-tertiary">· {files.length}</span>
					</button>
					{filesOpen && (
						<div className="max-h-[240px] overflow-y-auto border-t border-white/[0.06] px-2 py-2 no-scrollbar">
							{files.map((f) => (
								<button
									key={f.filePath}
									type="button"
									onClick={() => onOpenFile(f)}
									className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
									title={f.filePath}
								>
									<FileCode className="size-3.5 shrink-0 text-text-tertiary group-hover:text-[#ff7a45]" />
									<span className="truncate text-xs text-text-secondary group-hover:text-text-primary">
										{basename(f.filePath)}
									</span>
									<span className="ml-auto hidden truncate font-mono text-[10px] text-text-tertiary sm:block">
										{f.filePath}
									</span>
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Actions */}
			<div className="flex flex-wrap items-center gap-2">
				{previewUrl && (
					<button
						type="button"
						onClick={onOpenPreview}
						className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
					>
						<ExternalLink className="size-4" /> Open preview
					</button>
				)}
				<button
					type="button"
					onClick={onEditWithAI}
					className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
				>
					<Sparkles className="size-4 text-[#ff7a45]" /> Edit with AI
				</button>
			</div>
		</div>
	);
}
