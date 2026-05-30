import { Sparkles, ClipboardList, Rocket, ArrowRight } from 'lucide-react';

/* ----------------------------- Meet Daisan AI ----------------------------- */

const STEPS = [
	{
		icon: Sparkles,
		title: 'Start with an idea',
		body: 'Describe the system, page, workflow, module or storefront section you want for Daisan.',
	},
	{
		icon: ClipboardList,
		title: 'Plan before building',
		body: 'Review scope, data model, UI, API and acceptance criteria before any change happens.',
	},
	{
		icon: Rocket,
		title: 'Refine and publish',
		body: 'Preview, iterate, and deploy to DaisanStore, B2B, B2C, showroom or admin.',
	},
];

export function MeetDaisanSection() {
	return (
		<section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28 z-10">
			<div className="text-center mb-12">
				<p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-3">Meet Daisan AI</p>
				<h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
					From idea to a deployed system
				</h2>
				<p className="mt-3 text-text-tertiary max-w-xl mx-auto">
					Plan first, build when ready, ship to your Daisan ecosystem.
				</p>
			</div>
			<div className="grid gap-5 md:grid-cols-3">
				{STEPS.map((s, i) => (
					<div key={s.title} className="rounded-xl border border-border-primary bg-bg-2/40 p-6">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
								<s.icon className="size-5" strokeWidth={2} />
							</div>
							<span className="font-mono text-xs text-text-tertiary">0{i + 1}</span>
						</div>
						<h3 className="mb-1.5 text-base font-semibold text-text-primary">{s.title}</h3>
						<p className="text-sm leading-relaxed text-text-tertiary">{s.body}</p>
					</div>
				))}
			</div>
		</section>
	);
}

/* ---------------------------- Templates teaser ---------------------------- */

const TEMPLATES: { cat: string; title: string; desc: string; prompt: string }[] = [
	{ cat: 'Storefront', title: 'DaisanStore Homepage', desc: 'Hero, featured collections, promotions.', prompt: 'Build a modern DaisanStore storefront homepage with a hero, featured collections grid, trending products and promotional banners.' },
	{ cat: 'PIM', title: 'Product Catalog Manager', desc: 'Filters, grid/list, bulk edit.', prompt: 'Create a PIM product catalog manager with an advanced filter sidebar, grid/list toggle, sorting and bulk edit.' },
	{ cat: 'Storefront', title: 'Tile Product Detail', desc: 'Gallery, specs, add to quote.', prompt: 'Build a premium tile product detail page with an image gallery, specifications, related products and an add-to-quote bar.' },
	{ cat: 'Showroom', title: 'Showroom Locator', desc: 'Map, list, contact details.', prompt: 'Create a showroom locator with a searchable list, map, opening hours and contact details.' },
	{ cat: 'Lead/RFQ', title: 'RFQ Quote Cart', desc: 'Add products, form, submit.', prompt: 'Build an RFQ quote cart flow: add products to a quote, customer details form, and submit a request that creates a lead.' },
	{ cat: 'B2B', title: 'B2B Pricing Portal', desc: 'Dealer tiers, pricing rules.', prompt: 'Create a B2B pricing portal with dealer tiers, contract pricing rules and a price preview.' },
	{ cat: 'Admin', title: 'Dealer Dashboard', desc: 'Orders, RFQs, account status.', prompt: 'Build a dealer dashboard with orders, RFQ status, account information and quick actions.' },
	{ cat: 'SEO', title: 'Local SEO Landing', desc: 'City landing for a showroom.', prompt: 'Create a local SEO landing page for a tile showroom in a specific city, with offers and a contact form.' },
];

export function TemplatesTeaser({ onUse }: { onUse: (prompt: string) => void }) {
	return (
		<section className="w-full max-w-6xl mx-auto px-6 py-16 z-10">
			<div className="mb-8 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
						Start from a Daisan template
					</h2>
					<p className="mt-2 text-text-tertiary">Production-ready starting points for commerce & operations.</p>
				</div>
			</div>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{TEMPLATES.map((t) => (
					<button
						key={t.title}
						type="button"
						onClick={() => onUse(t.prompt)}
						className="group rounded-xl border border-border-primary bg-bg-2/40 p-5 text-left transition-colors hover:border-accent/50"
					>
						<div className="mb-4 h-24 rounded-lg border border-border-primary/60 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
						<span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-accent/90">{t.cat}</span>
						<h3 className="text-sm font-semibold text-text-primary">{t.title}</h3>
						<p className="mt-1 text-xs leading-relaxed text-text-tertiary">{t.desc}</p>
						<span className="mt-3 inline-flex items-center gap-1 text-xs text-text-secondary transition-colors group-hover:text-accent">
							Use template <ArrowRight className="size-3" />
						</span>
					</button>
				))}
			</div>
		</section>
	);
}

/* -------------------------------- Final CTA ------------------------------- */

export function FinalCTA({ onStart }: { onStart: () => void }) {
	return (
		<section className="w-full px-6 py-20 z-10">
			<div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border-primary p-12 text-center">
				<div
					className="absolute inset-0 -z-10 opacity-50"
					style={{
						background:
							'radial-gradient(closest-side at 50% 120%, rgba(255,61,0,0.45), rgba(217,70,239,0.25) 45%, rgba(56,118,255,0.18) 70%, transparent 100%)',
					}}
				/>
				<p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">AI Commerce Builder</p>
				<h2 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">Ready to build?</h2>
				<p className="mx-auto mt-3 max-w-md text-text-tertiary">
					Describe what you want — Daisan AI plans it first, then builds it.
				</p>
				<button
					type="button"
					onClick={onStart}
					className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
				>
					Start building <ArrowRight className="size-4" />
				</button>
			</div>
		</section>
	);
}

/* --------------------------------- Footer --------------------------------- */

const FOOTER_COLS: { title: string; links: string[] }[] = [
	{ title: 'Product', links: ['AI Studio', 'Templates', 'Connectors', 'Deployments'] },
	{ title: 'Solutions', links: ['PIM', 'DaisanStore', 'B2B', 'B2C', 'Showroom', 'Lead/RFQ'] },
	{ title: 'Resources', links: ['Docs', 'Guides', 'Status', 'Support'] },
	{ title: 'Company', links: ['About', 'Security', 'Contact'] },
];

export function LandingFooter() {
	return (
		<footer className="z-10 mt-10 w-full border-t border-border-primary">
			<div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-5">
				<div className="col-span-2 md:col-span-1">
					<div className="flex items-center gap-2 font-semibold text-text-primary">Daisan AI</div>
					<p className="mt-2 text-xs leading-relaxed text-text-tertiary">
						AI builder for the Daisan commerce ecosystem.
					</p>
				</div>
				{FOOTER_COLS.map((col) => (
					<div key={col.title}>
						<p className="mb-3 text-xs font-semibold text-text-secondary">{col.title}</p>
						<ul className="space-y-2">
							{col.links.map((l) => (
								<li key={l} className="cursor-pointer text-xs text-text-tertiary transition-colors hover:text-text-primary">
									{l}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t border-border-primary">
				<div className="mx-auto max-w-6xl px-6 py-4 text-xs text-text-tertiary">© 2026 Daisan AI · daisan.ai</div>
			</div>
		</footer>
	);
}
