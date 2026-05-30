import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
	ArrowLeft,
	ArrowUp,
	Loader2,
	Sparkles,
	Hammer,
	ThumbsUp,
	ThumbsDown,
	Copy,
	Check,
	Share2,
	Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { getWorkMode, type WorkModeId } from '../work-modes';
import { Markdown } from '../chat/components/messages';

interface Turn {
	role: 'user' | 'assistant';
	content: string;
}

const stripDirective = (s: string) => s.replace(/^\[CHẾ ĐỘ[^\]]*\][\s\S]*?---\n/, '');

export default function AdvisoryPage() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const initialQuery = params.get('q') || '';
	const modeId = (params.get('mode') as WorkModeId) || 'consult';
	const mode = getWorkMode(modeId);

	const [messages, setMessages] = useState<Turn[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [reactions, setReactions] = useState<Record<number, 'like' | 'dislike'>>({});
	const [copied, setCopied] = useState<number | null>(null);
	const sentInitial = useRef(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const send = async (text: string, isInitial = false) => {
		const trimmed = text.trim();
		if (!trimmed || loading) return;
		const prior = messages;
		const assistantIndex = prior.length + 1;
		setMessages([...prior, { role: 'user', content: trimmed }, { role: 'assistant', content: '' }]);
		setInput('');
		setLoading(true);
		let acc = '';
		try {
			const promptToSend = isInitial ? `${mode.directive}\n\n---\n${trimmed}` : trimmed;
			await apiClient.streamAdvisory(promptToSend, prior, (chunk) => {
				acc += chunk;
				setMessages((cur) => {
					const copy = [...cur];
					copy[assistantIndex] = { role: 'assistant', content: acc };
					return copy;
				});
			});
			if (!acc.trim()) {
				setMessages((cur) => {
					const copy = [...cur];
					copy[assistantIndex] = { role: 'assistant', content: 'Xin lỗi, tôi chưa tạo được câu trả lời. Vui lòng thử lại.' };
					return copy;
				});
			}
		} catch (e) {
			setMessages((cur) => {
				const copy = [...cur];
				copy[assistantIndex] = {
					role: 'assistant',
					content: acc || (e instanceof Error ? `Lỗi: ${e.message}` : 'Có lỗi xảy ra, vui lòng thử lại.'),
				};
				return copy;
			});
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

	const switchToBuild = () => {
		const topic = initialQuery || messages.find((m) => m.role === 'user')?.content || '';
		navigate(`/chat/new?query=${encodeURIComponent(topic)}&projectType=app`);
	};

	const react = (i: number, kind: 'like' | 'dislike') => {
		setReactions((r) => {
			const next = { ...r };
			if (next[i] === kind) delete next[i];
			else next[i] = kind;
			return next;
		});
		toast.success(kind === 'like' ? 'Cảm ơn phản hồi 👍' : 'Đã ghi nhận 👎');
	};
	const copy = async (i: number, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(i);
			setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
		} catch {
			toast.error('Không copy được');
		}
	};
	const share = async (text: string) => {
		const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string }) => Promise<void> };
		if (nav.share) {
			try {
				await nav.share({ title: 'Daisan.ai', text });
			} catch {
				/* user cancelled */
			}
		} else {
			await navigator.clipboard.writeText(text).catch(() => {});
			toast.success('Đã copy nội dung để chia sẻ');
		}
	};
	const email = (text: string) => {
		window.location.href = `mailto:?subject=${encodeURIComponent('Tư vấn từ Daisan.ai')}&body=${encodeURIComponent(text)}`;
	};

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
					<span className="hidden truncate text-xs text-text-tertiary sm:inline">{mode.description} · không tạo project</span>
					<button
						onClick={switchToBuild}
						className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border-primary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
					>
						<Hammer className="size-3.5" /> Chuyển sang Build
					</button>
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
									{stripDirective(m.content)}
								</div>
							</div>
						) : (
							<div key={i} className="flex items-start gap-3">
								<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
									<Sparkles className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="prose-sm text-sm leading-relaxed text-text-secondary">
										{m.content ? <Markdown>{m.content}</Markdown> : <span className="text-text-tertiary">…</span>}
									</div>
									{/* Actions (chỉ khi đã có nội dung và không đang stream dòng cuối) */}
									{m.content && !(loading && i === messages.length - 1) && (
										<div className="mt-2 flex items-center gap-1">
											<ActionBtn active={reactions[i] === 'like'} title="Thích" onClick={() => react(i, 'like')}>
												<ThumbsUp className="size-3.5" />
											</ActionBtn>
											<ActionBtn active={reactions[i] === 'dislike'} title="Không thích" onClick={() => react(i, 'dislike')}>
												<ThumbsDown className="size-3.5" />
											</ActionBtn>
											<ActionBtn title="Copy" onClick={() => copy(i, m.content)}>
												{copied === i ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
											</ActionBtn>
											<ActionBtn title="Chia sẻ" onClick={() => share(m.content)}>
												<Share2 className="size-3.5" />
											</ActionBtn>
											<ActionBtn title="Gửi email" onClick={() => email(m.content)}>
												<Mail className="size-3.5" />
											</ActionBtn>
										</div>
									)}
								</div>
							</div>
						),
					)}
					{loading && messages[messages.length - 1]?.content === '' && (
						<div className="flex items-center gap-2 pl-10 text-sm text-text-tertiary">
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
						Muốn tạo code? Bấm <span className="text-accent">Chuyển sang Build</span> ở trên hoặc về trang chủ chọn chế độ Build.
					</p>
				</div>
			</div>
		</div>
	);
}

function ActionBtn({
	children,
	onClick,
	title,
	active,
}: {
	children: React.ReactNode;
	onClick: () => void;
	title: string;
	active?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			title={title}
			aria-label={title}
			className={
				'flex size-7 items-center justify-center rounded-md transition-colors ' +
				(active ? 'bg-accent/15 text-accent' : 'text-text-tertiary hover:bg-bg-2/60 hover:text-text-primary')
			}
		>
			{children}
		</button>
	);
}
