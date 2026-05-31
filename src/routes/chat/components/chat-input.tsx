import { type FormEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { WebSocket } from 'partysocket';
import { Square, ArrowUp, ListPlus, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { sendWebSocketMessage } from '../utils/websocket-helpers';
import type { ImageAttachment } from '@/api-types';
import { type UsageSummary } from '@/hooks/use-limits';
import { ModeSelector, type ChatMode } from './mode-selector';
import { ModelQualitySelector } from './model-quality-selector';
import { ImageUploadButton } from '@/components/image-upload-button';
import { ImageAttachmentPreview } from '@/components/image-attachment-preview';
import { CreditsBanner } from '@/components/credits-banner';

interface ChatInputProps {
	// Form state
	newMessage: string;
	onMessageChange: (message: string) => void;
	onSubmit: (e: FormEvent) => void;

	// Image upload
	images: ImageAttachment[];
	onAddImages: (files: File[]) => void;
	onRemoveImage: (id: string) => void;
	isProcessing: boolean;

	// Drag and drop
	isChatDragging: boolean;
	chatDragHandlers: {
		onDragEnter: (e: React.DragEvent) => void;
		onDragLeave: (e: React.DragEvent) => void;
		onDragOver: (e: React.DragEvent) => void;
		onDrop: (e: React.DragEvent) => void;
	};

	// Disabled / activity states
	isChatDisabled: boolean;
	isRunning: boolean;
	isGenerating: boolean;
	isGeneratingBlueprint: boolean;
	isDebugging: boolean;

	// WebSocket
	websocket?: WebSocket;

	// Refs
	chatFormRef: RefObject<HTMLFormElement | null>;

	// Usage limits
	limitsData?: UsageSummary | null;
	onConnectCloudflare?: () => void;

	// Plan/Build mode
	mode: ChatMode;
	onModeChange: (mode: ChatMode) => void;

	// Optional: connection state for "type offline, send on reconnect"
	connectionState?: 'connecting' | 'connected' | 'reconnecting' | 'failed';
	// Optional explicit stop handler (falls back to websocket stop_generation)
	onStop?: () => void;
	// Authoritative "a build is running" (from the server build-job state
	// machine). Keeps Stop visible even after reload/reconnect.
	isBuildActive?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 160;
const MIN_TEXTAREA_HEIGHT = 48;

// Heuristic: does this read like a large redirection rather than a small add-on?
function looksLikeBigChange(text: string): boolean {
	const t = text.toLowerCase();
	if (text.trim().length > 180) return true;
	const bigSignals = [
		'instead', 'rewrite', 'redo', 'start over', 'redesign', 'scrap', 'completely',
		'thay vì', 'làm lại', 'viết lại', 'đổi toàn bộ', 'thay đổi toàn bộ', 'thiết kế lại',
		'bỏ hết', 'làm mới', 'đổi hướng',
	];
	return bigSignals.some((s) => t.includes(s));
}

export function ChatInput({
	newMessage,
	onMessageChange,
	onSubmit,
	images,
	onAddImages,
	onRemoveImage,
	isProcessing,
	isChatDragging,
	chatDragHandlers,
	isChatDisabled,
	isGenerating,
	isGeneratingBlueprint,
	isDebugging,
	websocket,
	chatFormRef,
	limitsData,
	onConnectCloudflare,
	mode,
	onModeChange,
	connectionState,
	onStop,
	isBuildActive,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isStopping, setIsStopping] = useState(false);
	const [queuedCount, setQueuedCount] = useState(0);
	const [showBigChangeConfirm, setShowBigChangeConfirm] = useState(false);

	// Stop must be available whenever a build is genuinely running. Prefer the
	// authoritative server signal; OR-in the live activity flags as a fallback.
	const isBuilding = Boolean(isBuildActive) || isGenerating || isGeneratingBlueprint || isDebugging;
	const hasText = newMessage.trim().length > 0;
	const isReconnecting = connectionState === 'reconnecting' || connectionState === 'connecting';

	// Current phase label for the status pill.
	const phaseLabel = isGeneratingBlueprint
		? 'Generating blueprint'
		: isDebugging
			? 'Deep debugging'
			: isGenerating
				? 'Generating code'
				: 'Working';

	// Placeholder: never the old "Please wait..." — always inviting input.
	const placeholder = isReconnecting
		? 'Reconnecting… you can keep typing'
		: isBuilding
			? 'Add instructions while Daisan is working...'
			: 'Ask Daisan...';

	// Auto-grow textarea (min 48, max 160 then scroll).
	const autoResize = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = Math.min(Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT) + 'px';
	};
	useEffect(autoResize, [newMessage]);

	// Clear the queued chip once the build finishes (instructions consumed/flushed).
	useEffect(() => {
		if (!isBuilding) setQueuedCount(0);
	}, [isBuilding]);

	const stop = () => {
		if (isStopping) return;
		setIsStopping(true);
		if (onStop) onStop();
		else if (websocket) sendWebSocketMessage(websocket, 'stop_generation');
		// Safety: clear the spinner if no state change arrives.
		setTimeout(() => setIsStopping(false), 6000);
	};
	// Reset the stopping spinner once the build actually halts.
	useEffect(() => {
		if (!isBuilding) setIsStopping(false);
	}, [isBuilding]);

	const submitNow = () => {
		// Delegate the actual send to the parent (handles limits, ws, draft clear).
		onSubmit(new Event('submit') as unknown as FormEvent);
	};

	const queueInstruction = () => {
		submitNow();
		setQueuedCount((c) => c + 1);
	};

	const handlePrimary = () => {
		if (!hasText) return;
		if (isBuilding) {
			// Building: decide queue vs interrupt.
			if (looksLikeBigChange(newMessage)) {
				setShowBigChangeConfirm(true);
			} else {
				queueInstruction();
			}
		} else {
			submitNow();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handlePrimary();
		}
	};

	const stopAndApply = () => {
		setShowBigChangeConfirm(false);
		stop();
		// Send the new prompt fresh; the parent includes prior context server-side.
		submitNow();
	};

	return (
		<div className="shrink-0 px-3 pt-2 md:px-4 md:pb-4 bg-transparent chat-input-safe">
			<div className="mx-auto w-full max-w-[860px]">
				<CreditsBanner limitsData={limitsData} onConnectCloudflare={onConnectCloudflare}>
					{/* Status / queue pills (only while building) */}
					{(isBuilding || queuedCount > 0) && (
						<div className="mb-2 flex flex-wrap items-center gap-2">
							{isBuilding && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5a1f]/30 bg-[#ff5a1f]/10 px-2.5 py-1 text-xs font-medium text-[#ff7a45]">
									<Sparkles className="size-3 animate-pulse" />
									Daisan is building · {phaseLabel}
								</span>
							)}
							{queuedCount > 0 && (
								<span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-text-secondary">
									<ListPlus className="size-3" />
									{queuedCount} update{queuedCount > 1 ? 's' : ''} queued
								</span>
							)}
						</div>
					)}

					{/* Big-change confirm popover */}
					{showBigChangeConfirm && (
						<div className="mb-2 rounded-2xl border border-white/10 bg-[#202020] p-3 shadow-lg">
							<div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
								<AlertTriangle className="size-4 text-[#ff7a45]" />
								Apply this change now?
							</div>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => {
										setShowBigChangeConfirm(false);
										queueInstruction();
									}}
									className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-white/10"
								>
									Queue for next step
								</button>
								<button
									type="button"
									onClick={stopAndApply}
									className="rounded-lg bg-[#ff5a1f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#ff5a1f]/90"
								>
									Stop and apply now
								</button>
								<button
									type="button"
									onClick={() => setShowBigChangeConfirm(false)}
									className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary"
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					{/* Composer shell */}
					<div
						{...chatDragHandlers}
						className={`rounded-[22px] border bg-[#1f1f1f] shadow-lg shadow-black/30 transition-colors ${
							isChatDragging
								? 'border-[#ff5a1f]'
								: 'border-white/10 focus-within:border-[#ff5a1f]'
						}`}
					>
						<form ref={chatFormRef} onSubmit={(e) => { e.preventDefault(); handlePrimary(); }}>
							{/* Image previews */}
							{images.length > 0 && (
								<div className="px-3 pt-3">
									<ImageAttachmentPreview images={images} onRemove={onRemoveImage} compact />
								</div>
							)}

							{/* Main input row */}
							<div className="flex items-end gap-2 px-2.5 py-2">
								{/* Left: attach */}
								<div className="flex items-center pb-1">
									<ImageUploadButton
										onFilesSelected={onAddImages}
										disabled={isProcessing}
										className="touch-target"
									/>
								</div>

								{/* Center: textarea (NEVER disabled while building) */}
								<textarea
									ref={textareaRef}
									id="daisan-composer"
									value={newMessage}
									onChange={(e) => onMessageChange(e.target.value)}
									onKeyDown={handleKeyDown}
									rows={1}
									placeholder={placeholder}
									className="flex-1 resize-none overflow-y-auto no-scrollbar bg-transparent py-2.5 text-[16px] md:text-sm leading-relaxed text-text-primary outline-none placeholder:text-text-tertiary"
									style={{ minHeight: MIN_TEXTAREA_HEIGHT, maxHeight: MAX_TEXTAREA_HEIGHT }}
								/>

								{/* Right: Stop (while building) + Send/Queue */}
								<div className="flex items-center gap-1.5 pb-1">
									{isBuilding && (
										<button
											type="button"
											onClick={stop}
											disabled={isStopping}
											aria-label="Stop generation"
											title="Stop generation"
											className="touch-target flex size-9 items-center justify-center rounded-xl bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-60"
										>
											{isStopping ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Square className="size-4 fill-current" />
											)}
										</button>
									)}
									<button
										type="button"
										onClick={handlePrimary}
										disabled={!hasText}
										aria-label={isBuilding ? 'Queue instruction' : 'Send'}
										title={isBuilding ? 'Queue instruction' : 'Send'}
										className={`touch-target flex size-9 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-text-tertiary ${
											isBuilding ? 'bg-white/15 hover:bg-white/25' : 'bg-[#ff5a1f] hover:bg-[#ff5a1f]/90'
										}`}
									>
										{isBuilding ? <ListPlus className="size-4" /> : <ArrowUp className="size-4" />}
									</button>
								</div>
							</div>

							{/* Bottom toolbar */}
							<div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-2.5 py-1.5">
								<div className="flex items-center gap-1.5">
									<ModelQualitySelector disabled={false} />
								</div>
								<ModeSelector mode={mode} onModeChange={onModeChange} disabled={isChatDisabled && !isBuilding} />
							</div>
						</form>
					</div>

					{isStopping && (
						<div className="mt-1.5 px-1 text-xs text-text-tertiary">Stopping…</div>
					)}
				</CreditsBanner>
			</div>
		</div>
	);
}
