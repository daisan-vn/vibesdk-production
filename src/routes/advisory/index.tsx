import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getWorkMode, type WorkModeId } from '../work-modes';
import { Markdown } from '../chat/components/messages';

interface Turn {
	role: 'user' | 'assistant';
	content: string;
}

export default function AdvisoryPage() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const initialQuery = params.get('q') || '';
	const modeId = (params.get('mode') as WorkModeId) || 'consult';
	const mode = getWorkMode(modeId);

	const [messages, setMessages] = useState<Turn[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const sentInitial = useRef(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const send = async (text: string, isInitial = false) => {
		const trimmed = text.trim();
		if (!trimmed || loading) return;
		const prior = messages;
		setMessages([...prior, { role: 'user', content: trimmed }]);
		setInput('');
		setLoading(true);
		try {
			const promptToSend = isInitial ? `${mode.directive}\n\n---\n${trimmed}` : trimmed;
			const res = await apiClient.advisoryChat(promptToSend, prior);
			const answer = res.success && res.data ? res.data.response : res.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
			setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
		} catch (e) {
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại.' },
			]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!sentInitial.current && initialQuery) {
			sentInitial.current = true;
			void send(initialQuery, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	const ModeIcon = mode.icon;

	return (
		<div className="flex min-h-screen flex-col bg-bg-3">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b border-border-primary bg-bg-3/80 backdrop-blur-md">
				<div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
					<button onClick={() => navigate('/')} className="text-text-tertiary hover:text-text-primary">
						<ArrowLeft className="size-4" />
					</button>
					<span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
						<ModeIcon className="size-3.5" /> {mode.label}
					</span>
					<span className="truncate text-xs text-text-tertiary">{mode.description} · không tạo project</span>
				</div>
			</div>

			{/* Messages */}
			<div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
				{messages.length === 0 && !loading && (
					<div className="py-16 text-center text-sm text-text-tertiary">
						<Sparkles className="mx-auto mb-3 size-6 text-accent" />
						Đặt câu hỏi để Daisan.ai tư vấn — không sinh code/dự án ở chế độ này.
					</div>
				)}
				<div className="space-y-5">
					{messages.map((m, i) =>
						m.role === 'user' ? (
							<div key={i} className="flex justify-end">
								<div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 px-4 py-2.5 text-sm text-text-primary">
									{m.content.replace(/^\[CHẾ ĐỘ[^\]]*\]\s*[\s\S]*?---\n/, '')}
								</div>
							</div>
						) : (
							<div key={i} className="flex items-start gap-3">
								<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
									<Sparkles className="size-4" />
								</div>
								<div className="prose-sm min-w-0 flex-1 text-sm leading-relaxed text-text-secondary">
									<Markdown>{m.content}</Markdown>
								</div>
							</div>
						),
					)}
					{loading && (
						<div className="flex items-center gap-2 text-sm text-text-tertiary">
							<Loader2 className="size-4 animate-spin" /> Daisan.ai đang soạn câu trả lời…
						</div>
					)}
					<div ref={bottomRef} />
				</div>
			</div>

			{/* Composer */}
			<div className="sticky bottom-0 border-t border-border-primary bg-bg-3/80 backdrop-blur-md">
				<div className="mx-auto max-w-3xl px-4 py-3">
					<div className="flex items-end gap-2 rounded-2xl border border-border-primary bg-bg-2/60 p-2">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									void send(input);
								}
							}}
							rows={1}
							placeholder={`Hỏi tiếp ở chế độ ${mode.label}…`}
							className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
						/>
						<button
							onClick={() => void send(input)}
							disabled={loading || !input.trim()}
							className="flex size-9 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-50"
						>
							{loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
						</button>
					</div>
					<p className="mt-2 text-center text-[11px] text-text-tertiary/70">
						Muốn tạo code? Quay về trang chủ và chọn chế độ <span className="text-accent">Build</span>.
					</p>
				</div>
			</div>
		</div>
	);
}
