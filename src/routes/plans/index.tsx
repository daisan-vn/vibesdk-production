import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Loader2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { PlanData, PlanStatus } from '@/api-types';

export const PLAN_STATUS_STYLE: Record<PlanStatus, { label: string; cls: string }> = {
	draft: { label: 'Draft', cls: 'text-text-tertiary bg-bg-3/60 border-border-primary' },
	approved: { label: 'Approved', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
	superseded: { label: 'Superseded', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
	implemented: { label: 'Implemented', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
	archived: { label: 'Archived', cls: 'text-text-tertiary/70 bg-bg-3/40 border-border-primary/60' },
};

const FILTERS: (PlanStatus | 'all')[] = ['all', 'draft', 'approved', 'implemented', 'superseded', 'archived'];

export default function PlansPage() {
	const navigate = useNavigate();
	const [plans, setPlans] = useState<PlanData[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<PlanStatus | 'all'>('all');
	const [query, setQuery] = useState('');
	const [creating, setCreating] = useState(false);

	const load = () => {
		setLoading(true);
		apiClient
			.listPlans()
			.then((res) => {
				if (res.success && res.data) setPlans(res.data.plans);
			})
			.catch(() => toast.error('Failed to load plans'))
			.finally(() => setLoading(false));
	};

	useEffect(load, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return plans.filter((p) => {
			const matchStatus = filter === 'all' || p.status === filter;
			const matchQuery = !q || p.title.toLowerCase().includes(q) || (p.goal || '').toLowerCase().includes(q);
			return matchStatus && matchQuery;
		});
	}, [plans, filter, query]);

	const createPlan = async () => {
		setCreating(true);
		try {
			const res = await apiClient.createPlan({ title: 'Untitled plan' });
			if (res.success && res.data) {
				navigate(`/plans/${res.data.id}`);
			} else {
				toast.error(res.error?.message || 'Failed to create plan');
			}
		} catch {
			toast.error('Failed to create plan');
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-5xl px-4 py-10">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
					{/* Header */}
					<div className="relative mb-8 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-7 sm:px-8">
						<div
							aria-hidden
							className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 opacity-70 blur-2xl"
							style={{ background: 'radial-gradient(closest-side, rgba(255,61,0,0.30), rgba(217,70,239,0.16) 45%, transparent 72%)' }}
						/>
						<div className="relative flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
									<ClipboardList className="size-6" strokeWidth={1.75} />
								</div>
								<div>
									<h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
										Plans
									</h1>
									<p className="mt-1 text-sm text-text-tertiary">
										{loading ? 'Loading…' : `${plans.length} implementation plan${plans.length !== 1 ? 's' : ''}`}
									</p>
								</div>
							</div>
							<button
								onClick={createPlan}
								disabled={creating}
								className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] disabled:opacity-60"
							>
								{creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" strokeWidth={2.25} />} New plan
							</button>
						</div>
					</div>

					{/* Controls */}
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="relative w-full sm:max-w-xs">
							<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search plans…"
								className="h-10 w-full rounded-xl border border-border-primary bg-bg-2/60 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{FILTERS.map((f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className={
										filter === f
											? 'rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white'
											: 'rounded-full border border-border-primary bg-bg-2/40 px-3 py-1.5 text-xs capitalize text-text-tertiary transition-colors hover:border-accent/40 hover:text-text-primary'
									}
								>
									{f}
								</button>
							))}
						</div>
					</div>

					{/* List */}
					{loading ? (
						<div className="flex items-center gap-2 py-16 text-text-tertiary">
							<Loader2 className="size-4 animate-spin" /> Loading plans…
						</div>
					) : filtered.length === 0 ? (
						<div className="rounded-xl border border-border-primary bg-bg-2/40 p-10 text-center">
							<ClipboardList className="mx-auto mb-3 size-6 text-text-tertiary" />
							<p className="font-medium text-text-primary">{plans.length === 0 ? 'No plans yet' : 'No plans match your filter'}</p>
							<p className="mt-1 text-sm text-text-tertiary">
								Plans capture scope, data model, API and acceptance criteria before you build.
							</p>
							{plans.length === 0 && (
								<button
									onClick={createPlan}
									className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
								>
									<Plus className="size-4" /> Create your first plan
								</button>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{filtered.map((p) => {
								const style = PLAN_STATUS_STYLE[p.status];
								return (
									<button
										key={p.id}
										onClick={() => navigate(`/plans/${p.id}`)}
										className="block w-full rounded-xl border border-border-primary bg-bg-2/40 p-4 text-left transition-colors hover:border-accent/40"
									>
										<div className="flex items-center justify-between gap-3">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="truncate font-medium text-text-primary">{p.title}</h3>
													<span className={`rounded-full border px-2 py-0.5 text-[11px] ${style.cls}`}>{style.label}</span>
													{p.source === 'blueprint' && (
														<span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
															<Sparkles className="size-3" /> AI
														</span>
													)}
												</div>
												<p className="mt-0.5 truncate text-xs text-text-tertiary">
													{p.goal || 'No goal set yet'}
												</p>
											</div>
											<span className="shrink-0 text-[11px] text-text-tertiary">
												{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}
