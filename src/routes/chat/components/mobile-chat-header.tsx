import { Menu, ChevronDown, Zap, Eye, Code2, RotateCcw, X } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileChatHeaderProps {
	appTitle?: string;
	/** AI is actively generating blueprint / code / debugging */
	building: boolean;
	/** stage progress, e.g. "2/3" — shown in the status pill when present */
	progressLabel?: string;
	/** whether a preview/editor panel is available to open */
	hasPreview: boolean;
	/** whether the mobile preview overlay is currently open */
	previewOpen: boolean;
	onTogglePreview: () => void;
	onReset?: () => void;
}

/**
 * Compact, sticky mobile header for the chat/build workspace.
 * Only rendered on small screens (caller gates with `md:hidden`).
 * Left: menu (opens sidebar drawer). Center: project pill. Right: build/preview.
 */
export function MobileChatHeader({
	appTitle,
	building,
	progressLabel,
	hasPreview,
	previewOpen,
	onTogglePreview,
	onReset,
}: MobileChatHeaderProps) {
	const { setOpenMobile } = useSidebar();

	return (
		<header className="md:hidden sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-white/[0.08] bg-bg-1/90 px-2 backdrop-blur-md">
			{/* Left: menu */}
			<button
				type="button"
				onClick={() => setOpenMobile(true)}
				aria-label="Mở menu"
				className="touch-target flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
			>
				<Menu className="size-5" />
			</button>

			{/* Center: project / workspace pill */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="mx-auto flex min-w-0 max-w-[60vw] items-center gap-1.5 rounded-full border border-white/[0.08] bg-bg-2/80 px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-3/80"
					>
						{building && (
							<span className="relative flex size-2 shrink-0">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
						)}
						<span className="truncate">{appTitle || 'Daisan Platform'}</span>
						<ChevronDown className="size-4 shrink-0 text-text-tertiary" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="center" className="w-56">
					<div className="px-2 py-1.5 text-xs text-text-tertiary">
						{building
							? progressLabel
								? `Đang dựng · ${progressLabel}`
								: 'Đang dựng…'
							: hasPreview
								? 'Sẵn sàng'
								: 'Workspace'}
					</div>
					{onReset && (
						<DropdownMenuItem onClick={onReset}>
							<RotateCcw className="mr-2 size-4" />
							Đặt lại hội thoại
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Right: build status / preview toggle */}
			{hasPreview ? (
				<button
					type="button"
					onClick={onTogglePreview}
					aria-label={previewOpen ? 'Đóng xem trước' : 'Mở xem trước'}
					className="touch-target flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent transition-colors hover:bg-accent/25"
				>
					{previewOpen ? (
						<X className="size-5" />
					) : building ? (
						<Code2 className="size-5" />
					) : (
						<Eye className="size-5" />
					)}
				</button>
			) : (
				<div className="touch-target flex size-9 items-center justify-center rounded-lg text-text-tertiary">
					<Zap className={`size-5 ${building ? 'animate-pulse text-accent' : ''}`} />
				</div>
			)}
		</header>
	);
}
