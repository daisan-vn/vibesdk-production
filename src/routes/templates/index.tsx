import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LayoutTemplate, ArrowRight, Search } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from './data';
import { slugify } from './detail';

export default function TemplatesPage() {
	const navigate = useNavigate();
	const [activeCat, setActiveCat] = useState<string>('All');
	const [query, setQuery] = useState('');

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return TEMPLATES.filter((t) => {
			const matchCat = activeCat === 'All' || t.cat === activeCat;
			const matchQuery =
				!q ||
				t.title.toLowerCase().includes(q) ||
				t.desc.toLowerCase().includes(q) ||
				t.cat.toLowerCase().includes(q);
			return matchCat && matchQuery;
		});
	}, [activeCat, query]);

	const openTemplate = (title: string) => {
		navigate(`/templates/${slugify(title)}`);
	};

	const cats = ['All', ...TEMPLATE_CATEGORIES];

	return (
		<div className="min-h-screen bg-bg-3">
			<div className="container mx-auto max-w-6xl px-4 py-10">
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
									'radial-gradient(closest-side, rgba(255,61,0,0.35), rgba(217,70,239,0.18) 45%, transparent 72%)',
							}}
						/>
						<div className="relative flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
								<LayoutTemplate className="size-6" strokeWidth={1.75} />
							</div>
							<div>
								<h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
									Templates
								</h1>
								<p className="mt-1 text-sm text-text-tertiary">
									Production-ready starting points for the Daisan commerce ecosystem.
								</p>
							</div>
						</div>
					</div>

					{/* Controls: search + category filter */}
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="relative w-full sm:max-w-xs">
							<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search templates…"
								className="h-10 w-full rounded-xl border border-border-primary bg-bg-2/60 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{cats.map((c) => (
								<button
									key={c}
									onClick={() => setActiveCat(c)}
									className={
										activeCat === c
											? 'rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white'
											: 'rounded-full border border-border-primary bg-bg-2/40 px-3 py-1.5 text-xs text-text-tertiary transition-colors hover:border-accent/40 hover:text-text-primary'
									}
								>
									{c}
								</button>
							))}
						</div>
					</div>

					{/* Grid */}
					{filtered.length === 0 ? (
						<div className="rounded-xl border border-border-primary bg-bg-2/40 p-12 text-center text-sm text-text-tertiary">
							No templates match your search.
						</div>
					) : (
						<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{filtered.map((t) => (
								<button
									key={t.title}
									type="button"
									onClick={() => openTemplate(t.title)}
									className="group flex flex-col rounded-2xl border border-border-primary bg-bg-2/40 p-5 text-left transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
								>
									<div className="mb-4 h-28 rounded-xl border border-border-primary/60 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent transition-transform group-hover:scale-[1.02]" />
									<span className="mb-2 inline-block w-fit rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
										{t.cat}
									</span>
									<h3 className="text-base font-semibold text-text-primary">{t.title}</h3>
									<p className="mt-1 flex-1 text-xs leading-relaxed text-text-tertiary">
										{t.desc}
									</p>
									<span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors group-hover:text-accent">
										Use template <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
									</span>
								</button>
							))}
						</div>
					)}

					<p className="mt-10 text-center text-xs text-text-tertiary">
						Don't see what you need?{' '}
						<button onClick={() => navigate('/')} className="text-accent hover:underline">
							Describe it from scratch
						</button>{' '}
						and let Daisan AI build it.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
