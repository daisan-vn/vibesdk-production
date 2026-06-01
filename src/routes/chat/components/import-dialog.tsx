import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Github, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ndjsonStream } from '@/utils/ndjson-parser/ndjson-parser';

interface ImportDialogProps {
	open: boolean;
	onClose: () => void;
	/** Bilingual translate helper: t(english, vietnamese). */
	t: (en: string, vi: string) => string;
}

/**
 * Import an existing project — from a .zip upload or a public GitHub URL — with
 * optional environment variables (e.g. Supabase) seeded into a .env so apps that
 * read import.meta.env.VITE_* actually boot in the sandbox.
 */
export function ImportDialog({ open, onClose, t }: ImportDialogProps) {
	const navigate = useNavigate();
	const fileRef = useRef<HTMLInputElement>(null);
	const [importing, setImporting] = useState(false);
	const [githubUrl, setGithubUrl] = useState('');
	const [envVars, setEnvVars] = useState('');

	const consumeStream = useCallback(
		async (stream: Response) => {
			let agentId = '';
			for await (const obj of ndjsonStream(stream)) {
				if (obj.agentId) {
					agentId = obj.agentId;
				}
			}
			if (agentId) {
				onClose();
				navigate(`/chat/${agentId}`);
			} else {
				toast.error(t('Import did not return a session id', 'Import không trả về session id'));
			}
		},
		[navigate, onClose, t],
	);

	const handleZip = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (fileRef.current) {
				fileRef.current.value = '';
			}
			if (!file) {
				return;
			}
			setImporting(true);
			try {
				toast.info(t('Uploading and analyzing project…', 'Đang tải lên & phân tích project…'));
				const response = await apiClient.importProjectZip(file, envVars);
				await consumeStream(response.stream);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Import failed');
			} finally {
				setImporting(false);
			}
		},
		[consumeStream, envVars, t],
	);

	const handleGithub = useCallback(async () => {
		if (!githubUrl.trim()) {
			toast.error(t('Enter a GitHub repo URL', 'Nhập URL repo GitHub'));
			return;
		}
		setImporting(true);
		try {
			toast.info(t('Fetching repository…', 'Đang tải repository từ GitHub…'));
			const response = await apiClient.importProjectFromGithub(githubUrl.trim(), undefined, envVars);
			await consumeStream(response.stream);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'GitHub import failed');
		} finally {
			setImporting(false);
		}
	}, [consumeStream, envVars, githubUrl, t]);

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
			<div
				className="w-full max-w-lg rounded-xl border border-text/10 bg-bg-2 p-5 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-base font-semibold text-text-primary">
						{t('Import project', 'Import project')}
					</h2>
					<button onClick={onClose} className="rounded p-1 text-text-primary/50 hover:bg-accent hover:text-text-primary">
						<X className="size-4" />
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label className="mb-1.5 block text-xs font-medium text-text-primary/70">
							{t('Environment variables (optional)', 'Biến môi trường (tùy chọn)')}
						</label>
						<textarea
							value={envVars}
							onChange={(e) => setEnvVars(e.target.value)}
							placeholder={'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...'}
							rows={4}
							spellCheck={false}
							className="w-full resize-y rounded-md border border-text/10 bg-bg-3 px-3 py-2 font-mono text-xs text-text-primary/90 outline-none focus:border-accent/50"
						/>
						<p className="mt-1 text-[11px] text-text-primary/50">
							{t(
								'Paste env if the app needs Supabase/other vars to run. Written to a .env file.',
								'Dán env nếu app cần Supabase/biến khác để chạy. Sẽ ghi vào file .env.',
							)}
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-text/10 p-3">
							<div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
								<Upload className="size-4" /> {t('Upload .zip', 'Tải .zip')}
							</div>
							<input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={handleZip} />
							<button
								type="button"
								onClick={() => fileRef.current?.click()}
								disabled={importing}
								className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-accent/80 disabled:opacity-50"
							>
								{importing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
								{t('Choose file', 'Chọn file')}
							</button>
						</div>

						<div className="rounded-lg border border-text/10 p-3">
							<div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
								<Github className="size-4" /> {t('GitHub URL', 'GitHub URL')}
							</div>
							<input
								value={githubUrl}
								onChange={(e) => setGithubUrl(e.target.value)}
								placeholder="https://github.com/owner/repo"
								spellCheck={false}
								disabled={importing}
								className="mb-2 w-full rounded-md border border-text/10 bg-bg-3 px-2 py-1.5 text-xs text-text-primary/90 outline-none focus:border-accent/50"
							/>
							<button
								type="button"
								onClick={handleGithub}
								disabled={importing}
								className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-accent/80 disabled:opacity-50"
							>
								{importing ? <Loader2 className="size-3.5 animate-spin" /> : <Github className="size-3.5" />}
								{t('Import', 'Import')}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
