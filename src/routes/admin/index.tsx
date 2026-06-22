import { useEffect, useState, useCallback, type ReactNode } from 'react';
import {
	apiClient,
	type AdminUserRow,
	type AdminAppRow,
	type AdminStats,
} from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { RefreshCw, Users, LayoutGrid, Rocket, Save, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const PREVIEW_DOMAIN = 'daisan.app';

function fmtDate(v: string | number | null): string {
	if (!v) return '—';
	try {
		return new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
	} catch {
		return '—';
	}
}

function Centered({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-text-primary/70">
			{children}
		</div>
	);
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
	return (
		<div className="flex items-center gap-3 bg-bg-2 border border-text/10 rounded-lg p-4 flex-1 min-w-[160px]">
			<div className="text-brand">{icon}</div>
			<div>
				<div className="text-2xl font-semibold text-text-primary">{value.toLocaleString('vi-VN')}</div>
				<div className="text-xs text-text-primary/60">{label}</div>
			</div>
		</div>
	);
}

// ── Limit editor modal ─────────────────────────────────────────────
function LimitEditor({ user, onClose, onSaved }: { user: AdminUserRow; onClose: () => void; onSaved: () => void }) {
	const [appLimit, setAppLimit] = useState<string>('');
	const [llmLimit, setLlmLimit] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		let cancelled = false;
		apiClient
			.adminGetUserLimits(user.id)
			.then((r) => {
				if (cancelled) return;
				setAppLimit(r.data?.appCreationLimit != null ? String(r.data.appCreationLimit) : '');
				setLlmLimit(r.data?.llmCallsLimit != null ? String(r.data.llmCallsLimit) : '');
			})
			.finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [user.id]);

	const save = async () => {
		setSaving(true);
		try {
			const body = {
				appCreationLimit: appLimit.trim() === '' ? null : Number(appLimit),
				llmCallsLimit: llmLimit.trim() === '' ? null : Number(llmLimit),
			};
			const r = await apiClient.adminSetUserLimits(user.id, body);
			if (r.success) {
				toast.success('Đã lưu giới hạn');
				onSaved();
				onClose();
			} else {
				toast.error(r.error?.message || 'Lưu thất bại');
			}
		} catch (e) {
			toast.error('Lưu thất bại');
			console.error(e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
			<div className="w-full max-w-md bg-bg-2 border border-text/10 rounded-xl p-5" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between mb-1">
					<h3 className="text-lg font-medium text-text-primary">Giới hạn người dùng</h3>
					<button onClick={onClose} className="p-1 rounded hover:bg-accent text-text-primary/60">
						<X className="size-4" />
					</button>
				</div>
				<p className="text-xs text-text-primary/60 mb-4 truncate">{user.email}</p>

				{loading ? (
					<div className="py-8 text-center text-text-primary/60 text-sm">Đang tải…</div>
				) : (
					<div className="space-y-4">
						<label className="block">
							<span className="text-sm text-text-primary/80">Số app / ngày</span>
							<input
								type="number"
								min={0}
								value={appLimit}
								onChange={(e) => setAppLimit(e.target.value)}
								placeholder="mặc định (5)"
								className="mt-1 w-full bg-bg-3 border border-text/10 rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
							/>
						</label>
						<label className="block">
							<span className="text-sm text-text-primary/80">Số lần gọi AI / ngày</span>
							<input
								type="number"
								min={0}
								value={llmLimit}
								onChange={(e) => setLlmLimit(e.target.value)}
								placeholder="mặc định (5000)"
								className="mt-1 w-full bg-bg-3 border border-text/10 rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
							/>
						</label>
						<p className="text-xs text-text-primary/50">Để trống cả hai = xoá override (về mặc định hệ thống).</p>
						<div className="flex gap-2 pt-1">
							<button
								onClick={save}
								disabled={saving}
								className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
							>
								<Save className="size-4" />
								{saving ? 'Đang lưu…' : 'Lưu'}
							</button>
							<button onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-text/10 text-text-primary/80 hover:bg-accent">
								Huỷ
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// ── Admin page ─────────────────────────────────────────────────────
export default function AdminPage() {
	const { isLoading: authLoading } = useAuth();
	const [allowed, setAllowed] = useState<boolean | null>(null);
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [users, setUsers] = useState<AdminUserRow[]>([]);
	const [apps, setApps] = useState<AdminAppRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<'users' | 'apps'>('users');
	const [editUser, setEditUser] = useState<AdminUserRow | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const chk = await apiClient.adminCheck();
			if (!chk.data?.isAdmin) {
				setAllowed(false);
				return;
			}
			setAllowed(true);
			const [s, u, a] = await Promise.all([apiClient.adminStats(), apiClient.adminUsers(), apiClient.adminApps()]);
			if (s.data) setStats(s.data.stats);
			if (u.data) setUsers(u.data.users);
			if (a.data) setApps(a.data.apps);
		} catch (e) {
			console.error(e);
			toast.error('Không tải được dữ liệu admin');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!authLoading) load();
	}, [authLoading, load]);

	if (authLoading || allowed === null) return <Centered>Đang tải…</Centered>;
	if (!allowed)
		return (
			<Centered>
				<ShieldAlert className="size-8 text-orange-500" />
				<p className="text-text-primary">Bạn không có quyền truy cập trang admin.</p>
			</Centered>
		);

	return (
		<div className="max-w-6xl mx-auto px-4 py-6">
			<div className="flex items-center justify-between mb-5">
				<div>
					<h1 className="text-2xl font-semibold text-text-primary">Admin · daisan.ai</h1>
					<p className="text-sm text-text-primary/60">Quản trị toàn hệ thống</p>
				</div>
				<button
					onClick={load}
					className="flex items-center gap-2 text-sm border border-text/10 rounded-md px-3 py-1.5 text-text-primary/80 hover:bg-accent"
				>
					<RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
					Làm mới
				</button>
			</div>

			{stats && (
				<div className="flex flex-wrap gap-3 mb-6">
					<StatCard icon={<Users className="size-5" />} label="Người dùng" value={stats.users} />
					<StatCard icon={<LayoutGrid className="size-5" />} label="Ứng dụng đã tạo" value={stats.apps} />
					<StatCard icon={<Rocket className="size-5" />} label="Đã deploy" value={stats.deployedApps} />
				</div>
			)}

			<div className="flex gap-1 mb-4 border-b border-text/10">
				{(['users', 'apps'] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
							tab === t ? 'border-brand text-brand' : 'border-transparent text-text-primary/60 hover:text-text-primary'
						}`}
					>
						{t === 'users' ? `Người dùng (${users.length})` : `Ứng dụng (${apps.length})`}
					</button>
				))}
			</div>

			{loading ? (
				<div className="py-12 text-center text-text-primary/60 text-sm">Đang tải dữ liệu…</div>
			) : tab === 'users' ? (
				<div className="overflow-x-auto border border-text/10 rounded-lg">
					<table className="w-full text-sm">
						<thead className="bg-bg-3 text-text-primary/60 text-xs">
							<tr>
								<th className="text-left font-medium px-3 py-2">Email</th>
								<th className="text-left font-medium px-3 py-2">Tên</th>
								<th className="text-left font-medium px-3 py-2">Provider</th>
								<th className="text-right font-medium px-3 py-2">Apps</th>
								<th className="text-left font-medium px-3 py-2">Tham gia</th>
								<th className="text-right font-medium px-3 py-2">Limit</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u) => (
								<tr key={u.id} className="border-t border-text/10 hover:bg-bg-3/50">
									<td className="px-3 py-2 text-text-primary">{u.email}</td>
									<td className="px-3 py-2 text-text-primary/80">{u.displayName || '—'}</td>
									<td className="px-3 py-2 text-text-primary/60">{u.provider || '—'}</td>
									<td className="px-3 py-2 text-right text-text-primary/80">{u.appCount}</td>
									<td className="px-3 py-2 text-text-primary/60">{fmtDate(u.createdAt)}</td>
									<td className="px-3 py-2 text-right">
										<button
											onClick={() => setEditUser(u)}
											className="text-xs bg-accent hover:bg-accent/90 text-white rounded px-2.5 py-1"
										>
											Set limit
										</button>
									</td>
								</tr>
							))}
							{users.length === 0 && (
								<tr>
									<td colSpan={6} className="px-3 py-8 text-center text-text-primary/50">
										Chưa có người dùng.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			) : (
				<div className="overflow-x-auto border border-text/10 rounded-lg">
					<table className="w-full text-sm">
						<thead className="bg-bg-3 text-text-primary/60 text-xs">
							<tr>
								<th className="text-left font-medium px-3 py-2">Tên app</th>
								<th className="text-left font-medium px-3 py-2">Chủ sở hữu</th>
								<th className="text-left font-medium px-3 py-2">Trạng thái</th>
								<th className="text-left font-medium px-3 py-2">Hiển thị</th>
								<th className="text-left font-medium px-3 py-2">URL</th>
								<th className="text-left font-medium px-3 py-2">Tạo</th>
							</tr>
						</thead>
						<tbody>
							{apps.map((a) => (
								<tr key={a.id} className="border-t border-text/10 hover:bg-bg-3/50">
									<td className="px-3 py-2 text-text-primary max-w-[220px] truncate">{a.title}</td>
									<td className="px-3 py-2 text-text-primary/70">{a.userEmail || '(ẩn danh)'}</td>
									<td className="px-3 py-2 text-text-primary/60">{a.status}</td>
									<td className="px-3 py-2 text-text-primary/60">{a.visibility}</td>
									<td className="px-3 py-2">
										{a.deploymentId ? (
											<a
												href={`https://${a.deploymentId}.${PREVIEW_DOMAIN}`}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 text-brand hover:underline"
											>
												Mở <ExternalLink className="size-3" />
											</a>
										) : (
											<span className="text-text-primary/40">chưa deploy</span>
										)}
									</td>
									<td className="px-3 py-2 text-text-primary/60">{fmtDate(a.createdAt)}</td>
								</tr>
							))}
							{apps.length === 0 && (
								<tr>
									<td colSpan={6} className="px-3 py-8 text-center text-text-primary/50">
										Chưa có ứng dụng.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{editUser && <LimitEditor user={editUser} onClose={() => setEditUser(null)} onSaved={load} />}
		</div>
	);
}
