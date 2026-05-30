import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Cloud, ExternalLink, Rocket, AlertTriangle, Loader2, Wand2, CheckCircle2, XCircle } from 'lucide-react';
import { usePaginatedApps } from '@/hooks/use-paginated-apps';

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

function Check({ ok, label }: { ok: boolean; label: string }) {
	return (
		<span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
			{ok ? <CheckCircle2 className="size-3.5 text-green-400" /> : <XCircle className="size-3.5 text-text-tertiary/60" />}
			{label}
		</span>
	);
}

export default function DeploymentsPage() {
	const navigate = useNavigate();
	const { apps, loading, totalCount } = usePaginatedApps({ type: 'user', defaultSort: 'recent', limit: 40 });

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

										{/* Diagnostics row */}
										<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-primary/60 pt-3">
											<Check ok label="App record" />
											<Check ok={deployed} label="Deployed" />
											<Check ok={!!app.deploymentUrl} label="Live URL" />
											{problem && (
												<span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
													<AlertTriangle className="size-3.5" />
													{st === 'failed' ? 'Last deploy failed — open the Studio and redeploy' : 'Open the Studio and click Deploy to publish'}
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}

					<p className="mt-8 text-center text-xs text-text-tertiary">
						Deep diagnostics (build logs, DNS, router lookup) are coming soon.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
