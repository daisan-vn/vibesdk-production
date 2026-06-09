import { useState } from 'react';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api-client';
import type { CommitInfo } from '@/api-types';
import { toast } from 'sonner';

interface CheckpointsMenuProps {
	chatId: string | undefined;
	disabled?: boolean;
	/** Called after a successful revert so the preview can be refreshed. */
	onReverted?: () => void;
}

function relativeTime(iso: string): string {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) {
		return '';
	}
	const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
	if (diffSec < 60) return 'vừa xong';
	const minutes = Math.round(diffSec / 60);
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.round(hours / 24);
	return `${days} ngày trước`;
}

/**
 * Lovable-style checkpoint menu: lists git commits (each generated step) and lets
 * the user restore the project to any of them. Backed by the git history that the
 * agent already commits on every file change.
 */
export function CheckpointsMenu({ chatId, disabled = false, onReverted }: CheckpointsMenuProps) {
	const [checkpoints, setCheckpoints] = useState<CommitInfo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [revertingOid, setRevertingOid] = useState<string | null>(null);

	const loadCheckpoints = async () => {
		if (!chatId) {
			return;
		}
		setIsLoading(true);
		const list = await apiClient.listCheckpoints(chatId);
		setCheckpoints(list);
		setIsLoading(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			void loadCheckpoints();
		}
	};

	const handleRevert = async (oid: string) => {
		if (!chatId || revertingOid) {
			return;
		}
		const confirmed = window.confirm(
			'Khôi phục dự án về checkpoint này? Các thay đổi sau đó sẽ bị hoàn tác.',
		);
		if (!confirmed) {
			return;
		}
		setRevertingOid(oid);
		const success = await apiClient.revertCheckpoint(chatId, oid);
		setRevertingOid(null);
		if (success) {
			toast.success('Đã khôi phục checkpoint');
			onReverted?.();
		} else {
			toast.error('Khôi phục thất bại');
		}
	};

	return (
		<DropdownMenu onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					title="Checkpoints"
					className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
				>
					<History className="size-3.5" />
					Checkpoints
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="max-h-80 w-72 overflow-y-auto">
				<DropdownMenuLabel>Khôi phục checkpoint</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isLoading ? (
					<div className="flex items-center gap-2 px-2 py-3 text-xs text-text-tertiary">
						<Loader2 className="size-3.5 animate-spin" /> Đang tải…
					</div>
				) : checkpoints.length === 0 ? (
					<div className="px-2 py-3 text-xs text-text-tertiary">Chưa có checkpoint nào.</div>
				) : (
					checkpoints.map((checkpoint) => (
						<DropdownMenuItem
							key={checkpoint.oid}
							onSelect={(event) => {
								event.preventDefault();
								void handleRevert(checkpoint.oid);
							}}
							className="flex items-start gap-2"
						>
							{revertingOid === checkpoint.oid ? (
								<Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" />
							) : (
								<RotateCcw className="mt-0.5 size-3.5 shrink-0 text-text-tertiary" />
							)}
							<span className="flex min-w-0 flex-col">
								<span className="truncate text-xs text-text-primary">
									{checkpoint.message || checkpoint.oid.slice(0, 7)}
								</span>
								<span className="text-[10px] text-text-tertiary">{relativeTime(checkpoint.timestamp)}</span>
							</span>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
