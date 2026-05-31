import { useState } from 'react';
import { ClipboardList, Rocket, Pencil, Plus, ChevronDown, ChevronRight, Layers, Database, Boxes } from 'lucide-react';
import type { PhasicBlueprint } from '@/api-types';

interface BlueprintCardProps {
	blueprint: PhasicBlueprint;
	/** A build is already in progress (hide "Build now"). */
	isBuilding: boolean;
	onBuildNow: () => void;
	onEditPlan: () => void;
	onAddRequirement: () => void;
}

/**
 * Compact, readable Blueprint summary shown inline in the chat stream once the
 * plan is ready: Summary · Pages/Sections · Stack · Data · Build phases, with
 * Build now / Edit plan / Add requirement actions.
 */
export function BlueprintCard({
	blueprint,
	isBuilding,
	onBuildNow,
	onEditPlan,
	onAddRequirement,
}: BlueprintCardProps) {
	const [phasesOpen, setPhasesOpen] = useState(false);

	const views = Array.isArray(blueprint.views) ? blueprint.views : [];
	const frameworks = Array.isArray(blueprint.frameworks) ? blueprint.frameworks : [];
	const roadmap = Array.isArray(blueprint.implementationRoadmap) ? blueprint.implementationRoadmap : [];
	const dataFlow =
		blueprint.dataFlow ||
		(blueprint as unknown as { architecture?: { dataFlow?: string } }).architecture?.dataFlow ||
		'';

	return (
		<div className="rounded-2xl border border-white/10 bg-[#202020] shadow-lg shadow-black/20">
			{/* Header */}
			<div className="flex items-start gap-3 border-b border-white/[0.06] px-4 py-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ff5a1f]/15 text-[#ff7a45]">
					<ClipboardList className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Blueprint</div>
					<h3 className="truncate text-sm font-semibold text-text-primary">{blueprint.title || 'Project plan'}</h3>
				</div>
			</div>

			<div className="space-y-3 px-4 py-3">
				{/* Summary */}
				{blueprint.description && (
					<p className="text-sm leading-relaxed text-text-secondary">{blueprint.description}</p>
				)}

				{/* Pages / Sections */}
				{views.length > 0 && (
					<Section icon={Layers} label="Pages / Sections">
						<div className="flex flex-wrap gap-1.5">
							{views.map((v, i) => (
								<span
									key={i}
									title={v.description}
									className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-text-secondary"
								>
									{v.name}
								</span>
							))}
						</div>
					</Section>
				)}

				{/* Stack / Components */}
				{frameworks.length > 0 && (
					<Section icon={Boxes} label="Stack">
						<div className="flex flex-wrap gap-1.5">
							{frameworks.slice(0, 10).map((f, i) => (
								<span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-text-tertiary">
									{f}
								</span>
							))}
						</div>
					</Section>
				)}

				{/* Data */}
				{dataFlow && (
					<Section icon={Database} label="Data">
						<p className="text-xs leading-relaxed text-text-secondary">{dataFlow}</p>
					</Section>
				)}

				{/* Build phases (collapsible) */}
				{roadmap.length > 0 && (
					<div>
						<button
							type="button"
							onClick={() => setPhasesOpen((v) => !v)}
							className="flex w-full items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
						>
							{phasesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
							Build phases
							<span className="text-text-tertiary">· {roadmap.length}</span>
						</button>
						{phasesOpen && (
							<ol className="mt-2 space-y-1.5 pl-1">
								{roadmap.map((r, i) => (
									<li key={i} className="flex gap-2 text-xs">
										<span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#ff5a1f]/15 text-[10px] font-semibold text-[#ff7a45]">
											{i + 1}
										</span>
										<div className="min-w-0">
											<div className="font-medium text-text-primary">
												{(r as unknown as { phase?: string; name?: string }).phase ??
													(r as unknown as { name?: string }).name ??
													`Phase ${i + 1}`}
											</div>
											{r.description && <div className="text-text-tertiary">{r.description}</div>}
										</div>
									</li>
								))}
							</ol>
						)}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-4 py-3">
				{!isBuilding && (
					<button
						type="button"
						onClick={onBuildNow}
						className="touch-target inline-flex items-center gap-1.5 rounded-xl bg-[#ff5a1f] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff5a1f]/90"
					>
						<Rocket className="size-4" /> Build now
					</button>
				)}
				<button
					type="button"
					onClick={onEditPlan}
					className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
				>
					<Pencil className="size-4" /> Edit plan
				</button>
				<button
					type="button"
					onClick={onAddRequirement}
					className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/10"
				>
					<Plus className="size-4" /> Add requirement
				</button>
			</div>
		</div>
	);
}

function Section({
	icon: Icon,
	label,
	children,
}: {
	icon: typeof Layers;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
				<Icon className="size-3.5" />
				{label}
			</div>
			{children}
		</div>
	);
}
