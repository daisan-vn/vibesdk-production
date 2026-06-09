import { useState } from 'react';
import { MousePointerClick, X, Send } from 'lucide-react';
import type { SelectedElement } from '../hooks/use-visual-edit';

interface VisualEditControllerProps {
	active: boolean;
	selected: SelectedElement | null;
	onToggle: () => void;
	onClearSelection: () => void;
	/** Receives the composed natural-language edit instruction to apply. */
	onApply: (instruction: string) => void;
}

/**
 * Floating visual-edit controls overlaid on the preview (Lovable-style): a toggle
 * to enter element-select mode, plus a panel to describe the change for the clicked
 * element. The change is applied through the normal build pipeline.
 */
export function VisualEditController({
	active,
	selected,
	onToggle,
	onClearSelection,
	onApply,
}: VisualEditControllerProps) {
	const [instruction, setInstruction] = useState('');

	const apply = () => {
		const text = instruction.trim();
		if (!text || !selected) {
			return;
		}
		const elementDesc = `<${selected.tag}>${selected.text ? ` có nội dung "${selected.text}"` : ''}${
			selected.classes ? ` (class: ${selected.classes})` : ''
		}`;
		onApply(`[Visual edit] Trong giao diện, chỉnh phần tử ${elementDesc} tại "${selected.selector}": ${text}`);
		setInstruction('');
		onClearSelection();
	};

	return (
		<>
			{/* Floating toggle (faithful to Lovable's bottom toolbar) */}
			<div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
				<button
					type="button"
					onClick={onToggle}
					title={active ? 'Tắt chỉnh sửa trực quan' : 'Chỉnh sửa trực quan: chọn phần tử để sửa'}
					className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg transition-colors ${
						active
							? 'border-[#ff5a1f] bg-[#ff5a1f] text-white'
							: 'border-white/10 bg-bg-2 text-text-primary hover:border-[#ff5a1f]/60'
					}`}
				>
					<MousePointerClick className="size-4" />
					{active ? 'Đang chọn phần tử…' : 'Visual edit'}
				</button>
			</div>

			{/* Selected-element edit panel */}
			{selected && (
				<div className="absolute bottom-20 left-1/2 z-40 w-[340px] -translate-x-1/2 rounded-xl border border-white/10 bg-bg-2 p-3 shadow-2xl">
					<div className="mb-2 flex items-center justify-between">
						<span className="truncate font-mono text-xs text-[#ff7a45]">&lt;{selected.tag}&gt;</span>
						<button
							type="button"
							onClick={onClearSelection}
							aria-label="Bỏ chọn"
							className="text-text-tertiary transition-colors hover:text-text-primary"
						>
							<X className="size-4" />
						</button>
					</div>
					{selected.text && (
						<p className="mb-2 line-clamp-2 text-xs text-text-tertiary">&ldquo;{selected.text}&rdquo;</p>
					)}
					<textarea
						value={instruction}
						onChange={(event) => setInstruction(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && !event.shiftKey) {
								event.preventDefault();
								apply();
							}
						}}
						rows={2}
						autoFocus
						placeholder="Mô tả thay đổi cho phần tử này…"
						className="w-full resize-none rounded-lg border border-white/10 bg-bg-1 px-2.5 py-2 text-sm text-text-primary outline-none focus:border-[#ff5a1f]"
					/>
					<div className="mt-2 flex justify-end">
						<button
							type="button"
							onClick={apply}
							disabled={!instruction.trim()}
							className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff5a1f] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#ff5a1f]/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Send className="size-3.5" />
							Áp dụng
						</button>
					</div>
				</div>
			)}
		</>
	);
}
