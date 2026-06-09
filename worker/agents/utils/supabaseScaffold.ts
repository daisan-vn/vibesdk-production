/**
 * Supabase scaffold (P2): a deterministic set of files seeded into a generated
 * project when "Supabase mode" is on, so every app ships with working auth + RBAC
 * + row-level security instead of relying on the LLM to reinvent it. The blueprint
 * step receives SUPABASE_SCAFFOLD_GUIDANCE so the generator builds ON this scaffold.
 *
 * v1 scope (confirmed): full auth + RBAC (roles/profiles + access-pending) + RLS,
 * with the SQL emitted as a migration the user runs in the Supabase SQL editor.
 *
 * Stack target of generated apps: React 19 + React Router v7 + @supabase/supabase-js v2.
 */
import type { FileOutputType } from '../schemas';

const ENV_EXAMPLE = `# Supabase — fill from your project: Settings -> API
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
`;

const SUPABASE_CLIENT = `import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // Surfaces a clear console hint instead of a silent blank screen.
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY - set them in .env');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
`;

const AUTH_CONTEXT = `import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AppRole = 'super_admin' | 'admin' | 'user';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  status: ProfileStatus;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) await loadProfile(newSession.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? '' } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
`;

const PROTECTED_ROUTE = `import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth, type AppRole } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Restrict to one or more roles (e.g. "admin" or ['admin','super_admin']). */
  requireRole?: AppRole | AppRole[];
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but not approved yet -> access pending screen.
  if (profile && profile.status !== 'approved') {
    return <Navigate to="/access-pending" replace />;
  }

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!profile || !allowed.includes(profile.role)) {
      return <Navigate to="/access-pending" replace />;
    }
  }

  return <>{children}</>;
}
`;

const LOGIN_PAGE = `import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/auth-context';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, fullName);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    navigate(mode === 'signin' ? '/' : '/access-pending', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
        {mode === 'signup' && (
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? 'Đang xử lý…' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center text-xs text-muted-foreground hover:underline"
        >
          {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
`;

const ACCESS_PENDING_PAGE = `import { useAuth } from '@/contexts/auth-context';

export default function AccessPending() {
  const { profile, signOut } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <h1 className="text-2xl font-semibold">Tài khoản đang chờ duyệt</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {profile?.status === 'rejected'
          ? 'Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên.'
          : 'Tài khoản đã được tạo nhưng cần quản trị viên phê duyệt trước khi truy cập.'}
      </p>
      <button onClick={() => signOut()} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
        Đăng xuất
      </button>
    </div>
  );
}
`;

const INIT_MIGRATION = `-- Daisan Supabase scaffold: profiles + RBAC + access-pending + RLS.
-- Run this once in Supabase Dashboard -> SQL Editor.

-- Roles + approval status used across the app.
do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- One profile row per auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'user',
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Is the current user an approved admin? SECURITY DEFINER avoids RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role in ('admin', 'super_admin')
  );
$$;

-- RLS: a user reads/updates their own profile; admins read/update all.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Auto-create a pending profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TEMPLATE for app tables (copy per entity into a new migration, e.g. 0002_items.sql):
-- create table if not exists public.items (
--   id uuid primary key default gen_random_uuid(),
--   owner_id uuid not null references auth.users(id) on delete cascade,
--   title text not null,
--   created_at timestamptz not null default now()
-- );
-- alter table public.items enable row level security;
-- create policy "items_owner_rw" on public.items
--   for all using (auth.uid() = owner_id or public.is_admin())
--   with check (auth.uid() = owner_id or public.is_admin());

-- Bootstrap your first admin (replace the email), then run:
-- update public.profiles set role = 'super_admin', status = 'approved'
-- where email = 'you@example.com';
`;

/** Files seeded into a project when Supabase mode is enabled. */
export function getSupabaseScaffoldFiles(): FileOutputType[] {
	return [
		{ filePath: '.env.example', fileContents: ENV_EXAMPLE, filePurpose: 'Supabase env var template' },
		{ filePath: 'src/lib/supabase.ts', fileContents: SUPABASE_CLIENT, filePurpose: 'Supabase client singleton' },
		{ filePath: 'src/contexts/auth-context.tsx', fileContents: AUTH_CONTEXT, filePurpose: 'Auth + profile/role context' },
		{ filePath: 'src/components/auth/ProtectedRoute.tsx', fileContents: PROTECTED_ROUTE, filePurpose: 'Route guard with RBAC + access-pending' },
		{ filePath: 'src/pages/Login.tsx', fileContents: LOGIN_PAGE, filePurpose: 'Login / signup page' },
		{ filePath: 'src/pages/AccessPending.tsx', fileContents: ACCESS_PENDING_PAGE, filePurpose: 'Awaiting-approval page' },
		{ filePath: 'supabase/migrations/0001_init.sql', fileContents: INIT_MIGRATION, filePurpose: 'Profiles + RBAC + RLS schema' },
	];
}

/** Ensure @supabase/supabase-js is present in the project's package.json dependencies. */
export function ensureSupabaseDep(packageJson: string): string {
	try {
		const pkg = JSON.parse(packageJson) as { dependencies?: Record<string, string> };
		pkg.dependencies = pkg.dependencies ?? {};
		if (!pkg.dependencies['@supabase/supabase-js']) {
			pkg.dependencies['@supabase/supabase-js'] = '^2.45.0';
		}
		return JSON.stringify(pkg, null, 2);
	} catch {
		return packageJson;
	}
}

/** Blueprint guidance appended when Supabase mode is enabled. */
export const SUPABASE_SCAFFOLD_GUIDANCE = `## Supabase backend (scaffold ĐÃ CÓ SẴN — BẮT BUỘC build trên nền này)
Dự án đã được seed sẵn Supabase auth + RBAC. KHÔNG tạo lại / KHÔNG ghi đè các file scaffold; hãy DÙNG chúng:
- \`src/lib/supabase.ts\` — Supabase client (đọc VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
- \`src/contexts/auth-context.tsx\` — bọc app bằng <AuthProvider>; dùng hook \`useAuth()\` (session, user, profile.role, profile.status, signIn/signUp/signOut).
- \`src/components/auth/ProtectedRoute.tsx\` — bọc route cần đăng nhập; route quản trị: <ProtectedRoute requireRole={['admin','super_admin']}>. Chưa approved → tự điều hướng /access-pending.
- \`src/pages/Login.tsx\` (route /login) và \`src/pages/AccessPending.tsx\` (route /access-pending).
- \`supabase/migrations/0001_init.sql\` — bảng profiles + enum role/status + RLS + trigger tạo profile khi signup + helper is_admin().

YÊU CẦU khi sinh app:
1. Bọc cây route bằng <AuthProvider>. Thêm route /login và /access-pending. Trang nội bộ bọc <ProtectedRoute>; trang /admin... bọc <ProtectedRoute requireRole={['admin','super_admin']}>.
2. Mọi truy cập dữ liệu dùng \`supabase\` client thật (KHÔNG mock data).
3. Mỗi bảng dữ liệu MỚI: thêm file SQL mới supabase/migrations/0002_*.sql (tạo bảng + enable RLS + policy theo owner_id/is_admin()), khớp với UI.
4. package.json PHẢI có "@supabase/supabase-js". Giữ .env.example liệt kê VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.`;
