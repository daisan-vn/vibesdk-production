import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	ClipboardList,
	Loader2,
	Pencil,
	Check,
	X,
	CheckCircle2,
	Archive,
	Hammer,
	Trash2,
	RotateCcw,
	Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { PlanData, PlanContent, PlanStatus } from '@/api-types';
import { PLAN_STATUS_STYLE } from './index';

const PROSE_FIELDS: { key: keyof PlanContent; label: string }[] = [
	{ key: 'userFlow', label: 'User flow' },
	{ key: 'dataModelImpact', label: 'Data model impact' },
	{ key: 'apiImpact', label: 'API impact' },
	{ key: 'uiChanges', label: 'UI changes' },
];

const LIST_FIELDS: { key: keyof PlanContent; label: string }[] = [
	{ key: 'assumptions', label: 'Assumptions' },
	{ key: 'affectedModules', label: 'Affected modules' },
	{ key: 'edgeCases', label: 'Edge cases' },
	{ key: 'acceptanceCriteria', label: 'Acceptance criteria' },
	{ key: 'implementationSteps', label: 'Implementation steps' },
];

const toList = (s: string): string[] =>
	s
		.split('\n')
		.map((x) => x.replace(/^[-*\d.\s]+/, '').trim())
		.filter(Boolean);
const listToText = (l?: string[]): string => (l && l.length ? l.join('\n') : '');

type DraftFields = {
	title: string;
	goal: string;
	prose: Record<string, string>;
	lists: Record<string, string>;
};

function buildDraft(plan: PlanData): DraftFields {
	const c = plan.content || {};
	return {
		title: plan.title,
		goal: plan.goal || '',
		prose: Object.fromEntries(PROSE_FIELDS.map((f) => [f.key, (c[f.key] as string) || ''])),
		lists: Object.fromEntries(LIST_FIELDS.map((f) => [f.key, listToText(c[f.key] as string[])])),
	};
}

export default function PlanDetailPage() {
	const { planId } = useParams();
	const navigate = useNavigate();
	const [plan, setPlan] = useState<PlanData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<DraftFields | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!planId) return;
		let alive = true;
		setLoading(true);
		apiClient
			.getPlan(planId)
			.then((res) => {
				if (!alive) return;
				if (res.success && res.data) setPlan(res.data);
				else setError(res.error?.message || 'Plan not found');
			})
			.catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load plan'))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [planId]);

	const startEdit = () => {
		if (!plan) return;
		setDraft(buildDraft(plan));
		setEditing(true);
	};

	const save = async () => {
		if (!plan || !draft) return;
		setSaving(true);
		try {
			const content: PlanContent = {};
			const rec = content as Record<string, unknown>;
			for (const f of PROSE_FIELDS) {
				const v = draft.prose[f.key as string]?.trim();
				if (v) rec[f.key as string] = v;
			}
			for (const f of LIST_FIELDS) {
				const v = toList(draft.lists[f.key as string] || '');
				if (v.length) rec[f.key as string] = v;
			}
			const res = await apiClient.updatePlan(plan.id, {
				title: draft.title.trim() || 'Untitled plan',
				goal: draft.goal.trim() || null,
				content,
			});
			if (res.success && res.data) {
				setPlan(res.data);
				setEditing(false);
				toast.success('Plan saved');
			} else {
				toast.error(res.error?.message || 'Failed to save');
			}
		} catch {
			toast.error('Failed to save plan');
		} finally {
			setSaving(false);
		}
	};

	const setStatus = async (status: PlanStatus) => {
		if (!plan) return;
		const res = await apiClient.updatePlan(plan.id, { status });
		if (res.success && res.data) {
			setPlan(res.data);
			toast.success(`Plan ${status}`);
		} else {
			toast.error(res.error?.message || 'Failed to update status');
		}
	};

	const buildFromPlan = () => {
		if (!plan) return;
		if (plan.appId) {
			navigate(`/chat/${plan.appId}`);
			return;
		}
		const brief = [plan.title, plan.goal].filter(Boolean).join(' — ');
		navigate(`/chat/new?query=${encodeURIComponent(brief || plan.title)}&projectType=app`);
	};

	const remove = async () => {
		if (!plan) return;
		if (!confirm('Delete this plan? This cannot be undone.')) return;
		const res = await apiClient.deletePlan(plan.id);
		if (res.success) {
			toast.success('Plan deleted');
			navigate('/plans');
		} else {
			toast.error(res.error?.message || 'Failed to delete');
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg-3 text-text-tertiary">
				<Loader2 className="mr-2 size-4 animate-spin" /> Loading plan…
			</div>
		);
	}

	if (error || !plan) {
		return (
			<div className="min-h-screen bg-bg-3">
				<div className="container mx-auto max-w-3xl px-4 py-16 text-center">
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
						<ClipboardList className="size-6" />
					</div>
					<h1 className="text-xl font-semibold text-text-primary">Plan not found</h1>
					<p className="mt-2 text-sm text-text-tertiary">{error || 'This plan may have been removed.'}</p>
					<button
						onClick={() => navigate('/plans')}
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
					>
						<ArrowLeft className="size-4" /> Back to plans
					</button>
				</div>
			</div>
		);
	}

	const style = PLAN_STATUS_STYLE[plan.status];
	const c = plan.content || {};

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-3xl px-4 py-8">
				<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
					<button
						onClick={() => navigate('/plans')}
						className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
					>
						<ArrowLeft className="size-3.5" /> Plans
					</button>

					{/* Header */}
					<div className="mb-6 rounded-2xl border border-border-primary bg-bg-2/40 p-5">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								{editing && draft ? (
									<input
										value={draft.title}
										onChange={(e) => setDraft({ ...draft, title: e.target.value })}
										className="w-full rounded-lg border border-border-primary bg-bg-3/60 px-3 py-2 text-lg font-semibold text-text-primary focus:border-accent/50 focus:outline-none"
										placeholder="Plan title"
									/>
								) : (
									<div className="flex items-center gap-2">
										<h1 className="text-xl font-semibold text-text-primary">{plan.title}</h1>
										<span className={`rounded-full border px-2 py-0.5 text-[11px] ${style.cls}`}>{style.label}</span>
										{plan.source === 'blueprint' && (
											<span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
												<Sparkles className="size-3" /> Captured from AI blueprint
											</span>
										)}
									</div>
								)}
								{!editing && (
									<p className="mt-1 text-xs text-text-tertiary">
										{plan.appId ? 'Project-scoped' : 'Standalone'} · updated{' '}
										{plan.updatedAt ? new Date(plan.updatedAt).toLocaleString() : '—'}
									</p>
								)}
							</div>
							<div className="flex items-center gap-2">
								{editing ? (
									<>
										<button
											onClick={save}
											disabled={saving}
											className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
										>
											{saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save
										</button>
										<button
											onClick={() => setEditing(false)}
											className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary"
										>
											<X className="size-3.5" /> Cancel
										</button>
									</>
								) : (
									<button
										onClick={startEdit}
										className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
									>
										<Pencil className="size-3.5" /> Edit
									</button>
								)}
							</div>
						</div>

						{/* Status actions */}
						{!editing && (
							<div className="mt-4 flex flex-wrap gap-2 border-t border-border-primary/60 pt-4">
								{plan.status !== 'approved' && plan.status !== 'implemented' && (
									<ActionBtn icon={CheckCircle2} label="Approve" onClick={() => setStatus('approved')} />
								)}
								<ActionBtn icon={Hammer} label="Build from plan" primary onClick={buildFromPlan} />
								{plan.status !== 'implemented' && (
									<ActionBtn icon={Check} label="Mark implemented" onClick={() => setStatus('implemented')} />
								)}
								{plan.status !== 'archived' ? (
									<ActionBtn icon={Archive} label="Archive" onClick={() => setStatus('archived')} />
								) : (
									<ActionBtn icon={RotateCcw} label="Re-open" onClick={() => setStatus('draft')} />
								)}
								<ActionBtn icon={Trash2} label="Delete" danger onClick={remove} />
							</div>
						)}
					</div>

					{/* Goal */}
					<Section label="Goal">
						{editing && draft ? (
							<Textarea value={draft.goal} onChange={(v) => setDraft({ ...draft, goal: v })} placeholder="What is this plan trying to achieve?" />
						) : (
							<Prose value={plan.goal} />
						)}
					</Section>

					{/* List fields */}
					{LIST_FIELDS.map((f) => (
						<Section key={f.key as string} label={f.label}>
							{editing && draft ? (
								<Textarea
									value={draft.lists[f.key as string]}
									onChange={(v) => setDraft({ ...draft, lists: { ...draft.lists, [f.key as string]: v } })}
									placeholder={`One ${f.label.toLowerCase()} per line`}
								/>
							) : (
								<BulletList items={c[f.key] as string[] | undefined} />
							)}
						</Section>
					))}

					{/* Prose fields */}
					{PROSE_FIELDS.map((f) => (
						<Section key={f.key as string} label={f.label}>
							{editing && draft ? (
								<Textarea
									value={draft.prose[f.key as string]}
									onChange={(v) => setDraft({ ...draft, prose: { ...draft.prose, [f.key as string]: v } })}
									placeholder={`Describe the ${f.label.toLowerCase()}`}
								/>
							) : (
								<Prose value={c[f.key] as string | undefined} />
							)}
						</Section>
					))}
				</motion.div>
			</div>
		</div>
	);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="mb-4">
			<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">{label}</h3>
			<div className="rounded-xl border border-border-primary bg-bg-2/40 p-4">{children}</div>
		</div>
	);
}

function Prose({ value }: { value?: string | null }) {
	if (!value) return <p className="text-sm text-text-tertiary/60">Not set yet.</p>;
	return <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{value}</p>;
}

function BulletList({ items }: { items?: string[] }) {
	if (!items || items.length === 0) return <p className="text-sm text-text-tertiary/60">Not set yet.</p>;
	return (
		<ul className="space-y-1.5">
			{items.map((it, i) => (
				<li key={i} className="flex gap-2 text-sm text-text-secondary">
					<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent/60" />
					<span>{it}</span>
				</li>
			))}
		</ul>
	);
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
	return (
		<textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			rows={Math.min(8, Math.max(3, value.split('\n').length + 1))}
			className="w-full resize-y rounded-lg border border-border-primary bg-bg-3/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary/70 focus:border-accent/50 focus:outline-none"
		/>
	);
}

function ActionBtn({
	icon: Icon,
	label,
	onClick,
	primary,
	danger,
}: {
	icon: typeof Check;
	label: string;
	onClick: () => void;
	primary?: boolean;
	danger?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={
				primary
					? 'inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white'
					: danger
						? 'inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10'
						: 'inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary'
			}
		>
			<Icon className="size-3.5" /> {label}
		</button>
	);
}
