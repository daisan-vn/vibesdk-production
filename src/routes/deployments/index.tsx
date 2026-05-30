import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
	Cloud,
	ExternalLink,
	Rocket,
	AlertTriangle,
	Loader2,
	Wand2,
	CheckCircle2,
	XCircle,
	Stethoscope,
	HelpCircle,
} from 'lucide-react';
import { usePaginatedApps } from '@/hooks/use-paginated-apps';
import { apiClient } from '@/lib/api-client';
import type { DeploymentDiagnostics } from '@/api-types';

type DeployStatus = 'deployed' | 'deploying' | 'failed' | 'none';

type DeployApp = {
	id: string;
	title?: string;
	status?: string;
	deploymentUrl?: string;
	deploymentStatus?: DeployStatus;
	updatedAtFormatted?: string;
	framework?: string;
};

function deployStatusOf(app: DeployApp): DeployStatus {
	if (app.deploymentStatus) return app.deploymentStatus;
	if (app.deploymentUrl) return 'deployed';
	return 'none';
}

const STATUS_STYLE: Record<DeployStatus, { label: string; cls: string }> = {
	deployed: { label: 'Deployed', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
	deploying: { label: 'Deploying', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
	failed: { label: 'Failed', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
	none: { label: 'Not deployed', cls: 'text-text-tertiary bg-bg-3/60 border-border-primary' },
};

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

type DiagState = { loading: boolean; data?: DeploymentDiagnostics; error?: string };

export default function DeploymentsPage() {
	const navigate = useNavigate();
	const { apps, loading, totalCount } = usePaginatedApps({ type: 'user', defaultSort: 'recent', limit: 40 });
	const [diag, setDiag] = useState<Record<string, DiagState>>({});

	const runDiagnostics = async (appId: string) => {
		setDiag((prev) => ({ ...prev, [appId]: { loading: true } }));
		try {
			const res = await apiClient.getDeploymentDiagnostics(appId);
			if (res.success && res.data) {
				setDiag((prev) => ({ ...prev, [appId]: { loading: false, data: res.data } }));
			} else {
				setDiag((prev) => ({
					...prev,
					[appId]: { loading: false, error: res.error?.message || 'Diagnostics failed' },
				}));
			}
		} catch (e) {
			setDiag((prev) => ({
				...prev,
				[appId]: { loading: false, error: e instanceof Error ? e.message : 'Diagnostics failed' },
			}));
		}
	};

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-5xl px-4 py-10">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
					{/* Header */}
					<div className="mb-8 flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
							<Rocket className="size-5" strokeWidth={2} />
						</div>
						<div>
							<h1 className="text-2xl font-semibold tracking-tight text-text-primary">Deployments</h1>
							<p className="text-sm text-text-tertiary">
								{loading ? 'Loading…' : `${totalCount} app${totalCount !== 1 ? 's' : ''} · live status & diagnostics`}
							</p>
						</div>
					</div>

					{loading ? (
						<div className="flex items-center gap-2 py-16 text-text-tertiary">
							<Loader2 className="size-4 animate-spin" /> Loading deployments…
						</div>
					) : (apps?.length ?? 0) === 0 ? (
						<div className="rounded-xl border border-border-primary bg-bg-2/40 p-10 text-center">
							<Cloud className="mx-auto mb-3 size-6 text-text-tertiary" />
							<p className="font-medium text-text-primary">No deployments yet</p>
							<p className="mt-1 text-sm text-text-tertiary">Build an app, then deploy it to get a live URL.</p>
							<button
								onClick={() => navigate('/')}
								className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
							>
								<Wand2 className="size-4" /> Build an app
							</button>
						</div>
					) : (
						<div className="space-y-3">
							{(apps as unknown as DeployApp[]).map((app) => {
								const st = deployStatusOf(app);
								const style = STATUS_STYLE[st];
								const deployed = st === 'deployed';
								const problem = st === 'failed' || st === 'none';
								const d = diag[app.id];
								const result = d?.data;
								return (
									<div key={app.id} className="rounded-xl border border-border-primary bg-bg-2/40 p-4">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<h3 className="truncate font-medium text-text-primary">{app.title || 'Untitled app'}</h3>
													<span className={`rounded-full border px-2 py-0.5 text-[11px] ${style.cls}`}>{style.label}</span>
												</div>
												{deployed && app.deploymentUrl ? (
													<a
														href={app.deploymentUrl}
														target="_blank"
														rel="noreferrer"
														className="mt-0.5 inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent"
													>
														{app.deploymentUrl.replace(/^https?:\/\//, '')} <ExternalLink className="size-3" />
													</a>
												) : (
													<p className="mt-0.5 text-xs text-text-tertiary">
														{app.updatedAtFormatted ? `Updated ${app.updatedAtFormatted}` : 'Not deployed to a live URL yet'}
													</p>
												)}
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={() => runDiagnostics(app.id)}
													disabled={d?.loading}
													className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary disabled:opacity-60"
												>
													{d?.loading ? (
														<Loader2 className="size-3.5 animate-spin" />
													) : (
														<Stethoscope className="size-3.5" />
													)}
													Run diagnostics
												</button>
												<button
													onClick={() => navigate(`/chat/${app.id}`)}
													className="rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
												>
													Open in Studio
												</button>
												{deployed && app.deploymentUrl && (
													<a
														href={app.deploymentUrl}
														target="_blank"
														rel="noreferrer"
														className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
													>
														Open live
													</a>
												)}
											</div>
										</div>

										{/* Quick (inferred) diagnostics row */}
										<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-primary/60 pt-3">
											<Check ok label="App record" />
											<Check ok={deployed} label="Deployed" />
											<Check ok={!!app.deploymentUrl} label="Live URL" />
											{problem && !result && (
												<span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
													<AlertTriangle className="size-3.5" />
													{st === 'failed' ? 'Last deploy failed — run diagnostics to confirm' : 'Run diagnostics to see why it has no live URL'}
												</span>
											)}
										</div>

										{/* Real diagnostics panel */}
										{d?.error && (
											<div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
												{d.error}
											</div>
										)}
										{result && (
											<div className="mt-3 rounded-lg border border-border-primary/70 bg-bg-3/40 p-3">
												<div className="mb-2 flex flex-wrap items-center gap-2">
													<span
														className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${SEVERITY_STYLE[result.severity].cls}`}
													>
														<span className={`size-1.5 rounded-full ${SEVERITY_STYLE[result.severity].dot}`} />
														{SEVERITY_STYLE[result.severity].label}
													</span>
													<span className="text-[11px] text-text-tertiary">
														checked {new Date(result.checkedAt).toLocaleTimeString()}
													</span>
												</div>
												<p className="text-xs leading-relaxed text-text-secondary">{result.verdict}</p>

												<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
													<Check ok={result.status === 'completed'} label={`App status: ${result.status}`} />
													<Check ok={!!result.deploymentId} label={result.deploymentId ? `Deployment slug: ${result.deploymentId}` : 'No deployment slug'} />
													<Check
														ok={result.workerInNamespace}
														label={
															result.workerInNamespace === null
																? `Worker in namespace: unknown`
																: result.workerInNamespace
																	? `Worker present in ${result.namespace}`
																	: `Worker missing from ${result.namespace}`
														}
													/>
													<Check
														ok={result.liveUrlStatus !== null && result.liveUrlStatus >= 200 && result.liveUrlStatus < 400}
														label={
															result.liveUrlStatus !== null
																? `Live URL responded ${result.liveUrlStatus}`
																: 'Live URL not reachable from server'
														}
													/>
												</div>

												{result.liveUrl && (
													<a
														href={result.liveUrl}
														target="_blank"
														rel="noreferrer"
														className="mt-3 inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent"
													>
														{result.liveUrl.replace(/^https?:\/\//, '')} <ExternalLink className="size-3" />
													</a>
												)}

												{(result.severity === 'failed' || result.severity === 'not_deployed') && (
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
								);
							})}
						</div>
					)}

					<p className="mt-8 text-center text-xs text-text-tertiary">
						Diagnostics probe the dispatch namespace and live URL directly — the authoritative source for “App not found”.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
