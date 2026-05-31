import { Sparkles, ClipboardList, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TEMPLATES } from './templates/data';
import { useI18n } from '@/contexts/i18n-context';

/* ----------------------------- Meet Daisan AI ----------------------------- */

export function MeetDaisanSection() {
	const { t } = useI18n();
	const STEPS = [
		{
			icon: Sparkles,
			title: t('Start with an idea', 'Bắt đầu từ một ý tưởng'),
			body: t(
				'Describe the system, page, workflow, module or storefront section you want for Daisan.',
				'Mô tả hệ thống, trang, quy trình, module hay khu vực gian hàng bạn muốn cho Daisan.',
			),
		},
		{
			icon: ClipboardList,
			title: t('Plan before building', 'Lên kế hoạch trước khi dựng'),
			body: t(
				'Review scope, data model, UI, API and acceptance criteria before any change happens.',
				'Xem phạm vi, mô hình dữ liệu, giao diện, API và tiêu chí nghiệm thu trước khi thay đổi.',
			),
		},
		{
			icon: Rocket,
			title: t('Refine and publish', 'Tinh chỉnh và phát hành'),
			body: t(
				'Preview, iterate, and deploy to DaisanStore, B2B, B2C, showroom or admin.',
				'Xem trước, chỉnh sửa và triển khai lên DaisanStore, B2B, B2C, showroom hoặc admin.',
			),
		},
	];

	return (
		<section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28 z-10">
			<div className="text-center mb-12">
				<p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-3">Meet Daisan AI</p>
				<h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
					{t('From idea to a deployed system', 'Từ ý tưởng đến hệ thống vận hành')}
				</h2>
				<p className="mt-3 text-text-tertiary max-w-xl mx-auto">
					{t(
						'Plan first, build when ready, ship to your Daisan ecosystem.',
						'Lên kế hoạch trước, dựng khi sẵn sàng, đưa vào hệ sinh thái Daisan.',
					)}
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

export function TemplatesTeaser({ onUse }: { onUse: (prompt: string) => void }) {
	const navigate = useNavigate();
	const { t } = useI18n();
	return (
		<section className="w-full max-w-6xl mx-auto px-6 py-16 z-10">
			<div className="mb-8 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
						{t('Start from a Daisan template', 'Bắt đầu từ mẫu Daisan')}
					</h2>
					<p className="mt-2 text-text-tertiary">
						{t(
							'Production-ready starting points for commerce & operations.',
							'Điểm khởi đầu sẵn sàng cho thương mại & vận hành.',
						)}
					</p>
				</div>
				<button
					onClick={() => navigate('/templates')}
					className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
				>
					{t('Browse all templates', 'Xem tất cả mẫu')} <ArrowRight className="size-4" />
				</button>
			</div>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{TEMPLATES.slice(0, 8).map((tpl) => (
					<button
						key={tpl.title}
						type="button"
						onClick={() => onUse(tpl.prompt)}
						className="group rounded-xl border border-border-primary bg-bg-2/40 p-5 text-left transition-colors hover:border-accent/50"
					>
						<div className="mb-4 h-24 rounded-lg border border-border-primary/60 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
						<span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-accent/90">{tpl.cat}</span>
						<h3 className="text-sm font-semibold text-text-primary">{tpl.title}</h3>
						<p className="mt-1 text-xs leading-relaxed text-text-tertiary">{tpl.desc}</p>
						<span className="mt-3 inline-flex items-center gap-1 text-xs text-text-secondary transition-colors group-hover:text-accent">
							{t('Use template', 'Dùng mẫu')} <ArrowRight className="size-3" />
						</span>
					</button>
				))}
			</div>
		</section>
	);
}

/* -------------------------------- Final CTA ------------------------------- */

export function FinalCTA({ onStart }: { onStart: () => void }) {
	const { t } = useI18n();
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
				<h2 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
					{t('Ready to build?', 'Sẵn sàng để dựng?')}
				</h2>
				<p className="mx-auto mt-3 max-w-md text-text-tertiary">
					{t(
						'Describe what you want — Daisan AI plans it first, then builds it.',
						'Mô tả điều bạn muốn — Daisan AI lên kế hoạch trước, rồi mới dựng.',
					)}
				</p>
				<button
					type="button"
					onClick={onStart}
					className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
				>
					{t('Start building', 'Bắt đầu dựng')} <ArrowRight className="size-4" />
				</button>
			</div>
		</section>
	);
}

/* --------------------------------- Footer --------------------------------- */

const FOOTER_ROUTES: Record<string, string> = {
	'AI Studio': '/',
	Templates: '/templates',
	Connectors: '/connectors',
	Deployments: '/deployments',
	PIM: '/solutions/pim',
	DaisanStore: '/solutions/storefront',
	B2B: '/solutions/b2b',
	B2C: '/solutions/b2c',
	Showroom: '/solutions/showroom',
	'Lead/RFQ': '/solutions/lead-rfq',
	Docs: '/resources',
	Guides: '/resources',
	Pricing: '/pricing',
	Support: '/resources',
	Community: '/community',
	Security: '/security',
	Enterprise: '/enterprise',
};

export function LandingFooter() {
	const navigate = useNavigate();
	const { t } = useI18n();

	const FOOTER_COLS: { title: string; links: string[] }[] = [
		{ title: t('Product', 'Sản phẩm'), links: ['AI Studio', 'Templates', 'Connectors', 'Deployments'] },
		{ title: t('Solutions', 'Giải pháp'), links: ['PIM', 'DaisanStore', 'B2B', 'B2C', 'Showroom', 'Lead/RFQ'] },
		{ title: t('Resources', 'Tài liệu'), links: ['Docs', 'Guides', 'Pricing', 'Support'] },
		{ title: t('Company', 'Công ty'), links: ['Community', 'Security', 'Enterprise'] },
	];

	// Display labels for footer links that should localize (proper nouns kept as-is).
	const LINK_LABEL: Record<string, string> = {
		Docs: t('Docs', 'Tài liệu'),
		Guides: t('Guides', 'Cẩm nang'),
		Pricing: t('Pricing', 'Bảng giá'),
		Support: t('Support', 'Hỗ trợ'),
		Community: t('Community', 'Cộng đồng'),
		Security: t('Security', 'Bảo mật'),
		Enterprise: t('Enterprise', 'Doanh nghiệp'),
		Templates: t('Templates', 'Mẫu dựng sẵn'),
		Connectors: t('Connectors', 'Kết nối'),
		Deployments: t('Deployments', 'Triển khai'),
	};

	return (
		<footer className="z-10 mt-10 w-full border-t border-border-primary">
			<div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-5">
				<div className="col-span-2 md:col-span-1">
					<div className="flex items-center gap-2 font-semibold text-text-primary">Daisan AI</div>
					<p className="mt-2 text-xs leading-relaxed text-text-tertiary">
						{t(
							'AI builder for the Daisan commerce ecosystem.',
							'Nền tảng AI dựng ứng dụng cho hệ sinh thái thương mại Daisan.',
						)}
					</p>
				</div>
				{FOOTER_COLS.map((col) => (
					<div key={col.title}>
						<p className="mb-3 text-xs font-semibold text-text-secondary">{col.title}</p>
						<ul className="space-y-2">
							{col.links.map((l) => (
								<li
									key={l}
									onClick={() => FOOTER_ROUTES[l] && navigate(FOOTER_ROUTES[l])}
									className="cursor-pointer text-xs text-text-tertiary transition-colors hover:text-text-primary"
								>
									{LINK_LABEL[l] ?? l}
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
