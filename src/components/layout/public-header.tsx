import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

/**
 * Shared public (logged-out) top navigation for marketing pages.
 * Brand = Daisan AI. Dark, sticky, Lovable-style. Bilingual EN/VI.
 */
export function PublicHeader() {
	const navigate = useNavigate();
	const { t } = useI18n();
	const [open, setOpen] = useState(false);

	const NAV: { label: string; to: string }[] = [
		{ label: t('Solutions', 'Giải pháp'), to: '/solutions' },
		{ label: t('Templates', 'Mẫu dựng sẵn'), to: '/templates' },
		{ label: t('Resources', 'Tài liệu'), to: '/resources' },
		{ label: t('Community', 'Cộng đồng'), to: '/community' },
		{ label: t('Enterprise', 'Doanh nghiệp'), to: '/enterprise' },
		{ label: t('Pricing', 'Bảng giá'), to: '/pricing' },
		{ label: t('Security', 'Bảo mật'), to: '/security' },
	];

	const login = () => {
		const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
		window.location.href = `/oauth/login?return_url=${encodeURIComponent(returnUrl)}`;
	};

	return (
		<header className="sticky top-0 z-40 border-b border-border-primary/70 bg-bg-3/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<button
					onClick={() => navigate('/')}
					className="flex items-center gap-2 font-semibold tracking-tight text-text-primary"
				>
					<span className="flex size-6 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-white">
						D
					</span>
					Daisan AI
				</button>

				<nav className="hidden items-center gap-1 md:flex">
					{NAV.map((n) => (
						<button
							key={n.to}
							onClick={() => navigate(n.to)}
							className="rounded-lg px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:text-text-primary"
						>
							{n.label}
						</button>
					))}
				</nav>

				<div className="hidden items-center gap-2 md:flex">
					<LanguageSwitcher />
					<button
						onClick={login}
						className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
					>
						{t('Log in', 'Đăng nhập')}
					</button>
					<button
						onClick={() => navigate('/')}
						className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
					>
						{t('Get started', 'Bắt đầu')}
					</button>
				</div>

				<div className="flex items-center gap-2 md:hidden">
					<LanguageSwitcher variant="icon" />
					<button
						onClick={() => setOpen((v) => !v)}
						className="flex size-9 items-center justify-center rounded-lg text-text-secondary"
						aria-label="Menu"
					>
						{open ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</div>
			</div>

			{open && (
				<div className="border-t border-border-primary/70 bg-bg-3/95 px-4 py-3 md:hidden">
					<div className="flex flex-col gap-1">
						{NAV.map((n) => (
							<button
								key={n.to}
								onClick={() => {
									setOpen(false);
									navigate(n.to);
								}}
								className="rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-2/60 hover:text-text-primary"
							>
								{n.label}
							</button>
						))}
						<div className="mt-2 flex gap-2">
							<button
								onClick={login}
								className="flex-1 rounded-lg border border-border-primary px-3 py-2 text-sm text-text-secondary"
							>
								{t('Log in', 'Đăng nhập')}
							</button>
							<button
								onClick={() => {
									setOpen(false);
									navigate('/');
								}}
								className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
							>
								{t('Get started', 'Bắt đầu')}
							</button>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
