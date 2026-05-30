import type { BlueprintType, PhasicBlueprint } from '@/api-types';
import clsx from 'clsx';
import {
	Sparkles,
	FileText,
	Palette,
	Package,
	LayoutGrid,
	Workflow,
	Database,
	Map as MapIcon,
	Rocket,
	AlertTriangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Markdown } from './messages';

const isPhasicBlueprint = (blueprint: BlueprintType): blueprint is PhasicBlueprint =>
	'views' in blueprint;

function Section({
	icon: Icon,
	title,
	children,
}: {
	icon: LucideIcon;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section>
			<h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-50/60">
				<Icon className="size-3.5 text-accent" strokeWidth={2} />
				{title}
			</h3>
			{children}
		</section>
	);
}

export function Blueprint({
	blueprint,
	className,
	...props
}: React.ComponentProps<'div'> & {
	blueprint: BlueprintType;
}) {
	if (!blueprint) return null;

	const phasicBlueprint = isPhasicBlueprint(blueprint) ? blueprint : null;

	return (
		<div
			className={clsx(
				'flex w-full flex-col overflow-hidden rounded-2xl border border-border-primary shadow-xl shadow-black/5',
				className,
			)}
			{...props}
		>
			{/* Premium gradient header with ambient glow */}
			<div className="relative overflow-hidden px-6 py-5">
				<div
					aria-hidden
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(120deg, rgba(255,61,0,0.95) 0%, rgba(217,70,239,0.85) 55%, rgba(56,118,255,0.8) 100%)',
					}}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 opacity-60 blur-2xl"
					style={{
						background:
							'radial-gradient(closest-side, rgba(255,255,255,0.55), transparent 70%)',
					}}
				/>
				<div className="relative flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
						<Sparkles className="size-5 text-white" strokeWidth={2} />
					</div>
					<div className="flex flex-col gap-0.5">
						<div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
							Implementation Plan
						</div>
						<div className="text-xl font-semibold leading-tight text-white">
							{blueprint.title}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col space-y-7 rounded-b-2xl bg-bg-2 px-6 py-6">
				{/* Overview */}
				<Section icon={FileText} title="Description">
					<Markdown className="text-sm leading-relaxed text-text-50">
						{blueprint.description}
					</Markdown>
				</Section>

				{Array.isArray(blueprint.colorPalette) && blueprint.colorPalette.length > 0 && (
					<Section icon={Palette} title="Color Palette">
						<div className="flex flex-wrap items-center gap-2.5">
							{blueprint.colorPalette.map((color, index) => (
								<div key={`color-${index}`} className="flex flex-col items-center gap-1">
									<div
										className="size-8 rounded-lg border border-text/10 shadow-sm ring-1 ring-inset ring-white/10"
										style={{ backgroundColor: color }}
										title={color}
									>
										<span className="sr-only">{color}</span>
									</div>
									<span className="font-mono text-[10px] text-text-50/50">{color}</span>
								</div>
							))}
						</div>
					</Section>
				)}

				{Array.isArray(blueprint.frameworks) && blueprint.frameworks.length > 0 && (
					<Section icon={Package} title="Dependencies">
						<div className="flex flex-wrap items-center gap-2">
							{blueprint.frameworks.map((framework, index) => {
								let name: string, version: string | undefined;

								// support scoped packages
								if (framework.startsWith('@')) {
									const secondAt = framework.lastIndexOf('@');
									if (secondAt === 0) {
										name = framework;
									} else {
										name = framework.slice(0, secondAt);
										version = framework.slice(secondAt + 1);
									}
								} else {
									[name, version] = framework.split('@');
								}

								return (
									<span
										key={`framework-${framework}-${index}`}
										className="flex items-center gap-0.5 rounded-full border border-border-primary bg-bg-3/60 px-2.5 py-1 text-xs text-text-primary/90 transition-colors hover:border-accent/40"
									>
										<span className="font-medium">{name}</span>
										{version && <span className="text-text-primary/45">@{version}</span>}
									</span>
								);
							})}
						</div>
					</Section>
				)}

				{/* Views */}
				{phasicBlueprint && phasicBlueprint.views?.length > 0 && (
					<Section icon={LayoutGrid} title="Views">
						<div className="space-y-3">
							{phasicBlueprint.views?.map((view, index) => (
								<div
									key={`view-${index}`}
									className="rounded-lg border border-border-primary/60 bg-bg-3/40 px-3 py-2"
								>
									<h4 className="text-xs font-semibold text-text-50/80">{view.name}</h4>
									<Markdown className="mt-0.5 text-sm text-text-50/90">
										{view.description}
									</Markdown>
								</div>
							))}
						</div>
					</Section>
				)}

				{/* User Flow */}
				{phasicBlueprint?.userFlow && (
					<Section icon={Workflow} title="User Flow">
						<div className="space-y-4">
							{phasicBlueprint.userFlow.uiLayout && (
								<div>
									<h4 className="mb-1.5 text-xs font-medium text-text-50/70">UI Layout</h4>
									<Markdown className="text-sm text-text-50/90">
										{phasicBlueprint.userFlow.uiLayout}
									</Markdown>
								</div>
							)}

							{phasicBlueprint.userFlow.uiDesign && (
								<div>
									<h4 className="mb-1.5 text-xs font-medium text-text-50/70">UI Design</h4>
									<Markdown className="text-sm text-text-50/90">
										{phasicBlueprint.userFlow.uiDesign}
									</Markdown>
								</div>
							)}

							{phasicBlueprint.userFlow.userJourney && (
								<div>
									<h4 className="mb-1.5 text-xs font-medium text-text-50/70">User Journey</h4>
									<Markdown className="text-sm text-text-50/90">
										{phasicBlueprint.userFlow.userJourney}
									</Markdown>
								</div>
							)}
						</div>
					</Section>
				)}

				{/* Data Flow */}
				{phasicBlueprint &&
					(phasicBlueprint.dataFlow || phasicBlueprint.architecture?.dataFlow) && (
						<Section icon={Database} title="Data Flow">
							<Markdown className="text-sm text-text-50/90">
								{phasicBlueprint.dataFlow || phasicBlueprint.architecture?.dataFlow}
							</Markdown>
						</Section>
					)}

				{/* Implementation Roadmap */}
				{phasicBlueprint && phasicBlueprint.implementationRoadmap?.length > 0 && (
					<Section icon={MapIcon} title="Implementation Roadmap">
						<ol className="space-y-3">
							{phasicBlueprint.implementationRoadmap?.map((roadmapItem, index) => (
								<li key={`roadmap-${index}`} className="flex gap-3">
									<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent ring-1 ring-accent/20">
										{index + 1}
									</span>
									<div className="space-y-0.5">
										<h4 className="text-xs font-semibold text-text-50/80">
											{roadmapItem.phase}
										</h4>
										<Markdown className="text-sm text-text-50/90">
											{roadmapItem.description}
										</Markdown>
									</div>
								</li>
							))}
						</ol>
					</Section>
				)}

				{/* Initial Phase */}
				{phasicBlueprint?.initialPhase && (
					<Section icon={Rocket} title="Initial Phase">
						<div>
							<h4 className="mb-1.5 text-xs font-semibold text-text-50/80">
								{phasicBlueprint.initialPhase.name}
							</h4>
							<Markdown className="mb-3 text-sm text-text-50/90">
								{phasicBlueprint.initialPhase.description}
							</Markdown>
							{Array.isArray(phasicBlueprint.initialPhase.files) &&
								phasicBlueprint.initialPhase.files.length > 0 && (
									<div>
										<h5 className="mb-2 text-xs font-medium text-text-50/60">
											Files to be created
										</h5>
										<div className="space-y-2">
											{phasicBlueprint.initialPhase.files.map((file, fileIndex) => (
												<div
													key={`initial-phase-file-${fileIndex}`}
													className="border-l-2 border-accent/30 pl-3"
												>
													<div className="font-mono text-xs text-text-50/85">{file.path}</div>
													<div className="text-xs text-text-50/55">{file.purpose}</div>
												</div>
											))}
										</div>
									</div>
								)}
						</div>
					</Section>
				)}

				{/* Pitfalls */}
				{phasicBlueprint && phasicBlueprint.pitfalls?.length > 0 && (
					<Section icon={AlertTriangle} title="Pitfalls">
						<ul className="space-y-2">
							{phasicBlueprint.pitfalls?.map((pitfall, index) => (
								<li
									key={`pitfall-${index}`}
									className="flex gap-2 text-sm text-text-50/90"
								>
									<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400/70" />
									<span>{pitfall}</span>
								</li>
							))}
						</ul>
					</Section>
				)}
			</div>
		</div>
	);
}
