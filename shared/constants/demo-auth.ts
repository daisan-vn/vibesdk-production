/**
 * Demo mode: use the app without real login (local / demo deployments).
 * Set to false for production with real authentication.
 */
export const ENABLE_DEMO_WITHOUT_AUTH = true;

export const DEMO_USER_ID = 'demo-123';
export const DEMO_ACCESS_TOKEN = 'demo-token';
export const DEMO_SESSION_ID = 'demo-session';
export const DEMO_EMAIL = 'demo@daisan.ai';
export const DEMO_DISPLAY_NAME = 'Demo User';

export function isDemoAccessToken(token: string | null | undefined): boolean {
	if (!token) return false;
	return token === DEMO_ACCESS_TOKEN || token === 'demo-token-123';
}
