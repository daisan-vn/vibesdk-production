import { useState } from 'react';
import { X, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface EnvEditorDialogProps {
	open: boolean;
	onClose: () => void;
	agentId: string;
}

/**
 * In-session env editor: paste/update environment variables (e.g. Supabase) for an
 * already-imported project. Writes a .env and redeploys so the preview boots with
 * the config — useful for apps imported without env that crash on missing VITE_*.
 */
export function EnvEditorDialog({ open, onClose, agentId }: EnvEditorDialogProps) {
	const [env, setEnv] = useState('');
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!env.trim()) {
			toast.error('Nhập ít nhất 1 biến môi trường');
			return;
		}
		setSaving(true);
		try {
			await apiClient.updateEnv(agentId, env);
			toast.success('Đã lưu .env & đang redeploy preview…');
			onClose();
		} catch {
			// apiClient already shows a toast on failure.
		} finally {
			setSaving(false);
		}
	};

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
			<div
				className="w-full max-w-lg rounded-xl border border-text/10 bg-bg-2 p-5 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-3 flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
						<KeyRound className="size-4" /> Environment variables
					</h2>
					<button onClick={onClose} className="rounded p-1 text-text-primary/50 hover:bg-accent hover:text-text-primary">
						<X className="size-4" />
					</button>
				</div>

				<textarea
					value={env}
					onChange={(e) => setEnv(e.target.value)}
					placeholder={'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...'}
					rows={6}
					spellCheck={false}
					autoFocus
					className="w-full resize-y rounded-md border border-text/10 bg-bg-3 px-3 py-2 font-mono text-xs text-text-primary/90 outline-none focus:border-accent/50"
				/>
				<p className="mt-1 text-[11px] text-text-primary/50">
					Ghi vào file <code>.env</code> rồi redeploy preview để Vite đọc lại{' '}
					<code>import.meta.env.VITE_*</code>. Dùng cho app import thiếu env (vd Supabase).
				</p>

				<div className="mt-4 flex justify-end gap-2">
					<button
						onClick={onClose}
						disabled={saving}
						className="rounded-md px-3 py-2 text-xs text-text-primary/70 hover:bg-accent disabled:opacity-50"
					>
						Hủy
					</button>
					<button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-medium text-text-primary hover:bg-accent/80 disabled:opacity-50"
					>
						{saving ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
						{saving ? 'Đang lưu…' : 'Lưu & redeploy'}
					</button>
				</div>
			</div>
		</div>
	);
}
