import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	LayoutGrid,
	Wand2,
	Rocket,
	ClipboardList,
	Settings as SettingsIcon,
	Activity as ActivityIcon,
	Eye,
	ExternalLink,
	Loader2,
	CheckCircle2,
	XCircle,
	HelpCircle,
	Stethoscope,
	Code2,
	Globe,
	Lock,
} from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import type { AppDetailsData, DeploymentDiagnostics } from '@/api-types';

type TabKey = 'overview' | 'studio' | 'plans' | 'deployments' | 'settings' | 'activity';

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
	{ key: 'overview', label: 'Overview', icon: LayoutGrid },
	{ key: 'studio', label: 'AI Studio', icon: Wand2 },
	{ key: 'plans', label: 'Plans', icon: ClipboardList },
	{ key: 'deployments', label: 'Deployments', icon: Rocket },
	{ key: 'settings', label: 'Settings', icon: SettingsIcon },
	{ key: 'activity', label: 'Activity', icon: ActivityIcon },
];

const SEVERITY_STYLE: Record<
	DeploymentDiagnostics['severity'],
	{ label: string; cls: string; dot: string }
> = {
	ok: { label: 'Healthy', cls: 'text-green-400 bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
	degraded: { label: 'Degraded', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
	failed: { label: 'Deploy failed', cls: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
	not_deployed: { label: 'Not deployed', cls: 'text-text-tertiary bg-bg-3/60 border-border-primary', dot: 'bg-text-tertiary' },
	unknown: { label: 'Unknown', cls: 'text-text-tertiary bg-bg-3/60 border-border-primary', dot: 'bg-text-tertiary' },
};

function Check({ ok, label }: { ok: boolean | null; label: string }) {
	return (
		<span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
			{ok === true ? (
				<CheckCircle2 className="size-3.5 text-green-400" />
			) : ok === false ? (
				<XCircle className="size-3.5 text-red-400/80" />
			) : (
				<HelpCircle className="size-3.5 text-text-tertiary/60" />
			)}
			{label}
		</span>
	);
}

function fmt(d: unknown): string {
	if (!d) return '—';
	const date = new Date(d as string);
	return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

export default function ProjectDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [app, setApp] = useState<AppDetailsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<TabKey>('overview');

	const [diag, setDiag] = useState<{ loading: boolean; data?: DeploymentDiagnostics; error?: string } | null>(null);

	useEffect(() => {
		if (!id) return;
		let alive = true;
		setLoading(true);
		apiClient
			.getAppDetails(id)
			.then((res) => {
				if (!alive) return;
				if (res.success && res.data) setApp(res.data);
				else setError(res.error?.message || 'Project not found');
			})
			.catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load project'))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [id]);

	const runDiagnostics = async () => {
		if (!id) return;
		setDiag({ loading: true });
		try {
			const res = await apiClient.getDeploymentDiagnostics(id);
			if (res.success && res.data) setDiag({ loading: false, data: res.data });
			else setDiag({ loading: false, error: res.error?.message || 'Diagnostics failed' });
		} catch (e) {
			setDiag({ loading: false, error: e instanceof Error ? e.message : 'Diagnostics failed' });
		}
	};

	// Auto-run diagnostics the first time the Deployments tab opens.
	useEffect(() => {
		if (tab === 'deployments' && id && diag === null) runDiagnostics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab, id]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg-3 text-text-tertiary">
				<Loader2 className="mr-2 size-4 animate-spin" /> Loading project…
			</div>
		);
	}

	if (error || !app) {
		return (
			<div className="min-h-screen bg-bg-3">
				<div className="container mx-auto max-w-3xl px-4 py-16 text-center">
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
						<LayoutGrid className="size-6" />
					</div>
					<h1 className="text-xl font-semibold text-text-primary">Project not found</h1>
					<p className="mt-2 text-sm text-text-tertiary">{error || 'This project may have been removed.'}</p>
					<button
						onClick={() => navigate('/projects')}
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
					>
						<ArrowLeft className="size-4" /> Back to projects
					</button>
				</div>
			</div>
		);
	}

	const liveUrl = app.cloudflareUrl || app.previewUrl || null;
	const completed = app.status === 'completed';

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-5xl px-4 py-8">
				<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
					{/* Back + header */}
					<button
						onClick={() => navigate('/projects')}
						className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary"
					>
						<ArrowLeft className="size-3.5" /> Projects
					</button>

					<div className="relative mb-6 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-6">
						<div
							aria-hidden
							className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 opacity-70 blur-2xl"
							style={{
								background:
									'radial-gradient(closest-side, rgba(255,61,0,0.30), rgba(217,70,239,0.16) 45%, transparent 72%)',
							}}
						/>
						<div className="relative flex flex-wrap items-start justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
									<LayoutGrid className="size-6" strokeWidth={1.75} />
								</div>
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<h1 className="text-2xl font-semibold tracking-tight text-text-primary">{app.title}</h1>
										<span
											className={`rounded-full border px-2 py-0.5 text-[11px] ${
												completed
													? 'border-green-500/20 bg-green-500/10 text-green-400'
													: 'border-blue-500/20 bg-blue-500/10 text-blue-400'
											}`}
										>
											{completed ? 'Completed' : 'Generating'}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full border border-border-primary bg-bg-3/60 px-2 py-0.5 text-[11px] text-text-tertiary">
											{app.visibility === 'public' ? <Globe className="size-3" /> : <Lock className="size-3" />}
											{app.visibility}
										</span>
									</div>
									<p className="mt-1 text-xs text-text-tertiary">
										{app.framework ? `${app.framework} · ` : ''}Updated {fmt(app.updatedAt)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => navigate(`/chat/${app.id}`)}
									className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
								>
									<Wand2 className="size-4" /> Open Studio
								</button>
								{liveUrl && (
									<a
										href={liveUrl}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1.5 rounded-xl border border-border-primary px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
									>
										Open live <ExternalLink className="size-3.5" />
									</a>
								)}
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="mb-6 flex flex-wrap gap-1 border-b border-border-primary">
						{TABS.map((t) => (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
									tab === t.key
										? 'border-accent text-text-primary'
										: 'border-transparent text-text-tertiary hover:text-text-secondary'
								}`}
							>
								<t.icon className="size-4" /> {t.label}
							</button>
						))}
					</div>

					{/* Tab content */}
					{tab === 'overview' && (
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<InfoCard label="Status" value={completed ? 'Completed' : 'Generating'} />
								<InfoCard label="Framework" value={app.framework || '—'} />
								<InfoCard label="Created" value={fmt(app.createdAt)} />
								<InfoCard label="Last updated" value={fmt(app.updatedAt)} />
								<InfoCard label="Deployment slug" value={app.deploymentId || 'Not deployed'} mono />
								<InfoCard label="Visibility" value={app.visibility} />
							</div>
							<div className="flex flex-wrap gap-2">
								<QuickAction icon={Wand2} label="Open in Studio" onClick={() => navigate(`/chat/${app.id}`)} />
								<QuickAction icon={Rocket} label="Deployment diagnostics" onClick={() => setTab('deployments')} />
								<QuickAction icon={Eye} label="View public page" onClick={() => navigate(`/app/${app.id}`)} />
								{liveUrl && (
									<QuickAction icon={ExternalLink} label="Open live URL" onClick={() => window.open(liveUrl, '_blank')} />
								)}
							</div>
						</div>
					)}

					{tab === 'studio' && (
						<TabPanel
							icon={Wand2}
							title="AI Studio"
							body="Chat with Daisan AI to plan and build this project. Plan mode discusses scope before any change; Build mode applies changes and shows progress."
							actionLabel="Open AI Studio"
							onAction={() => navigate(`/chat/${app.id}`)}
						/>
					)}

					{tab === 'plans' && (
						<TabPanel
							icon={ClipboardList}
							title="Implementation plans"
							body="Plans are produced inside the Studio using Plan mode — Daisan AI writes a structured implementation plan (scope, data model, UI, API, acceptance criteria) before building. Open the Studio and switch to Plan mode to create one."
							actionLabel="Open Studio in Plan mode"
							onAction={() => navigate(`/chat/${app.id}`)}
						/>
					)}

					{tab === 'deployments' && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-text-primary">Deployment diagnostics</h3>
								<button
									onClick={runDiagnostics}
									disabled={diag?.loading}
									className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-60"
								>
									{diag?.loading ? <Loader2 className="size-3.5 animate-spin" /> : <Stethoscope className="size-3.5" />}
									Re-run
								</button>
							</div>

							{diag?.loading && (
								<div className="flex items-center gap-2 py-6 text-sm text-text-tertiary">
									<Loader2 className="size-4 animate-spin" /> Probing dispatch namespace & live URL…
								</div>
							)}
							{diag?.error && (
								<div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{diag.error}</div>
							)}
							{diag?.data && (
								<div className="rounded-xl border border-border-primary/70 bg-bg-2/40 p-4">
									<div className="mb-2 flex flex-wrap items-center gap-2">
										<span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${SEVERITY_STYLE[diag.data.severity].cls}`}>
											<span className={`size-1.5 rounded-full ${SEVERITY_STYLE[diag.data.severity].dot}`} />
											{SEVERITY_STYLE[diag.data.severity].label}
										</span>
										<span className="text-[11px] text-text-tertiary">checked {new Date(diag.data.checkedAt).toLocaleTimeString()}</span>
									</div>
									<p className="text-xs leading-relaxed text-text-secondary">{diag.data.verdict}</p>
									<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
										<Check ok={diag.data.status === 'completed'} label={`App status: ${diag.data.status}`} />
										<Check ok={!!diag.data.deploymentId} label={diag.data.deploymentId ? `Deployment slug: ${diag.data.deploymentId}` : 'No deployment slug'} />
										<Check
											ok={diag.data.workerInNamespace}
											label={
												diag.data.workerInNamespace === null
													? 'Worker in namespace: unknown'
													: diag.data.workerInNamespace
														? `Worker present in ${diag.data.namespace}`
														: `Worker missing from ${diag.data.namespace}`
											}
										/>
										<Check
											ok={diag.data.liveUrlStatus !== null && diag.data.liveUrlStatus >= 200 && diag.data.liveUrlStatus < 400}
											label={diag.data.liveUrlStatus !== null ? `Live URL responded ${diag.data.liveUrlStatus}` : 'Live URL not reachable from server'}
										/>
									</div>
									{(diag.data.severity === 'failed' || diag.data.severity === 'not_deployed') && (
										<button
											onClick={() => navigate(`/chat/${app.id}`)}
											className="mt-3 block w-fit rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
										>
											Open Studio to redeploy
										</button>
									)}
								</div>
							)}
						</div>
					)}

					{tab === 'settings' && (
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<InfoCard label="Project ID" value={app.id} mono />
								<InfoCard label="Visibility" value={app.visibility} />
								<InfoCard label="Framework" value={app.framework || '—'} />
								<InfoCard label="Deployment slug" value={app.deploymentId || 'Not deployed'} mono />
							</div>
							<div className="rounded-xl border border-border-primary bg-bg-2/40 p-4">
								<p className="text-sm text-text-secondary">
									Project-level settings (rename, visibility, delete) are managed from the app actions menu and your
									workspace settings.
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<QuickAction icon={Code2} label="Open in Studio" onClick={() => navigate(`/chat/${app.id}`)} />
									<QuickAction icon={SettingsIcon} label="Workspace settings" onClick={() => navigate('/settings')} />
								</div>
							</div>
						</div>
					)}

					{tab === 'activity' && (
						<div className="space-y-3">
							<ActivityRow label="Project created" when={fmt(app.createdAt)} />
							<ActivityRow label="Last updated" when={fmt(app.updatedAt)} />
							<ActivityRow label={completed ? 'Generation completed' : 'Generation in progress'} when={fmt(app.updatedAt)} />
							{app.deploymentId && <ActivityRow label={`Deployed as ${app.deploymentId}`} when={fmt(app.updatedAt)} />}
							<p className="pt-2 text-center text-xs text-text-tertiary">A detailed activity timeline is coming soon.</p>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="rounded-xl border border-border-primary bg-bg-2/40 p-4">
			<p className="text-[11px] uppercase tracking-wider text-text-tertiary">{label}</p>
			<p className={`mt-1 truncate text-sm text-text-primary ${mono ? 'font-mono text-xs' : ''}`} title={value}>
				{value}
			</p>
		</div>
	);
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof LayoutGrid; label: string; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-2/40 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
		>
			<Icon className="size-3.5" /> {label}
		</button>
	);
}

function TabPanel({
	icon: Icon,
	title,
	body,
	actionLabel,
	onAction,
}: {
	icon: typeof LayoutGrid;
	title: string;
	body: string;
	actionLabel: string;
	onAction: () => void;
}) {
	return (
		<div className="rounded-2xl border border-border-primary bg-bg-2/40 p-6">
			<div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
				<Icon className="size-5" />
			</div>
			<h3 className="text-base font-semibold text-text-primary">{title}</h3>
			<p className="mt-1 max-w-xl text-sm leading-relaxed text-text-tertiary">{body}</p>
			<button
				onClick={onAction}
				className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
			>
				<Icon className="size-4" /> {actionLabel}
			</button>
		</div>
	);
}

function ActivityRow({ label, when }: { label: string; when: string }) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-border-primary bg-bg-2/40 px-4 py-3">
			<span className="text-sm text-text-secondary">{label}</span>
			<span className="text-xs text-text-tertiary">{when}</span>
		</div>
	);
}
