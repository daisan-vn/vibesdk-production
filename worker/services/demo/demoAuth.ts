/**
 * Demo authentication helpers for worker middleware.
 */

import {
	ENABLE_DEMO_WITHOUT_AUTH,
	DEMO_SESSION_ID,
} from 'shared/constants/demo-auth';
import type { AuthUserSession } from '../../types/auth-types';
import { AuthService } from '../../database/services/AuthService';

export { isDemoAccessToken } from 'shared/constants/demo-auth';

export function isDemoModeEnabled(_env: Env): boolean {
	return ENABLE_DEMO_WITHOUT_AUTH;
}

export async function getDemoUserSession(env: Env): Promise<AuthUserSession> {
	const authService = new AuthService(env);
	const user = await authService.ensureDemoUser();
	return { user, sessionId: DEMO_SESSION_ID };
}
