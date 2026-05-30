import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
	Plug,
	Github,
	Cloud,
	Store,
	Boxes,
	Building2,
	MessageSquare,
	CreditCard,
	Mail,
	BarChart3,
	Database,
	ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ConnectorStatus = 'connected' | 'available' | 'soon';

interface Connector {
	icon: LucideIcon;
	name: string;
	desc: string;
	status: ConnectorStatus;
	href?: string;
}

interface ConnectorGroup {
	group: string;
	items: Connector[];
}

const GROUPS: ConnectorGroup[] = [
	{
		group: 'Deploy & Source',
		items: [
			{
				icon: Cloud,
				name: 'Cloudflare',
				desc: 'Deploy apps to the edge with Workers for Platforms. Built in.',
				status: 'connected',
			},
			{
				icon: Github,
				name: 'GitHub',
				desc: 'Export any app to a GitHub repository and keep it in sync.',
				status: 'available',
			},
		],
	},
	{
		group: 'Daisan Commerce',
		items: [
			{
				icon: Store,
				name: 'DaisanStore',
				desc: 'Publish storefront pages and sections directly to DaisanStore.',
				status: 'soon',
			},
			{
				icon: Boxes,
				name: 'PIM',
				desc: 'Read products, attributes and categories from the Daisan PIM.',
				status: 'soon',
			},
			{
				icon: Building2,
				name: 'B2B Portal',
				desc: 'Sync dealer tiers, contract pricing and RFQ leads.',
				status: 'soon',
			},
		],
	},
	{
		group: 'Operations',
		items: [
			{
				icon: CreditCard,
				name: 'Payments',
				desc: 'Wire up checkout to your payment gateway.',
				status: 'soon',
			},
			{
				icon: Mail,
				name: 'Email',
				desc: 'Send transactional and marketing email from your apps.',
				status: 'soon',
			},
			{
				icon: MessageSquare,
				name: 'Chat / Support',
				desc: 'Embed live chat and route conversations to support.',
				status: 'soon',
			},
			{
				icon: BarChart3,
				name: 'Analytics',
				desc: 'Track traffic, conversion and product performance.',
				status: 'soon',
			},
			{
				icon: Database,
				name: 'Data Warehouse',
				desc: 'Export orders, leads and events to your warehouse.',
				status: 'soon',
			},
		],
	},
];

const STATUS_BADGE: Record<ConnectorStatus, { label: string; cls: string }> = {
	connected: { label: 'Connected', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
	available: { label: 'Available', cls: 'text-accent bg-accent/10 border-accent/20' },
	soon: { label: 'Coming soon', cls: 'text-text-tertiary bg-bg-3/60 border-border-primary' },
};

export default function ConnectorsPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-5xl px-4 py-10">
				<motion.div
					initial={{ opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					{/* Header */}
					<div className="relative mb-8 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8 sm:px-8">
						<div
							aria-hidden
							className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
							style={{
								background:
									'radial-gradient(closest-side, rgba(56,118,255,0.30), rgba(217,70,239,0.18) 45%, transparent 72%)',
							}}
						/>
						<div className="relative flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
								<Plug className="size-6" strokeWidth={1.75} />
							</div>
							<div>
								<h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
									Connectors
								</h1>
								<p className="mt-1 text-sm text-text-tertiary">
									Connect your apps to the Daisan ecosystem and external services.
								</p>
							</div>
						</div>
					</div>

					{GROUPS.map((g) => (
						<section key={g.group} className="mb-8">
							<h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
								{g.group}
							</h2>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{g.items.map((c) => {
									const badge = STATUS_BADGE[c.status];
									return (
										<div
											key={c.name}
											className="flex flex-col rounded-2xl border border-border-primary bg-bg-2/40 p-5"
										>
											<div className="mb-3 flex items-center justify-between">
												<div className="flex size-10 items-center justify-center rounded-xl bg-bg-3/60 text-text-secondary ring-1 ring-border-primary">
													<c.icon className="size-5" strokeWidth={1.75} />
												</div>
												<span
													className={`rounded-full border px-2 py-0.5 text-[11px] ${badge.cls}`}
												>
													{badge.label}
												</span>
											</div>
											<h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
											<p className="mt-1 flex-1 text-xs leading-relaxed text-text-tertiary">
												{c.desc}
											</p>
											<div className="mt-4">
												{c.status === 'connected' ? (
													<span className="inline-flex items-center gap-1.5 text-xs text-green-400">
														<span className="size-1.5 rounded-full bg-green-400" /> Active
													</span>
												) : c.status === 'available' ? (
													<span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
														Configure in app settings <ExternalLink className="size-3" />
													</span>
												) : (
													<span className="text-xs text-text-tertiary/70">Not yet available</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</section>
					))}

					<p className="mt-8 text-center text-xs text-text-tertiary">
						Need a connector that isn't here?{' '}
						<button onClick={() => navigate('/')} className="text-accent hover:underline">
							Describe it
						</button>{' '}
						and we'll help you build the integration.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
