/**
 * Admin Controller
 * Platform-wide admin endpoints: list all users + apps, edit per-user rate
 * limits (stored in KV user_config:<id>). Gated to ADMIN_EMAILS — the route
 * only requires `authenticated`; this controller enforces the admin allowlist.
 */

import { BaseController } from '../baseController';
import { RouteContext } from '../../types/route-context';
import { createLogger } from '../../../logger';
import { AdminService } from '../../../database/services/AdminService';
import { AuthUser } from '../../../types/auth-types';

// v1: hardcoded admin allowlist (owner). Can move to an env var later.
const ADMIN_EMAILS = ['nhamphongdaijsc@gmail.com'];

function isAdmin(user: AuthUser | null): boolean {
    return !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());
}

interface UserLimitsBody {
    appCreationLimit?: number | null;
    llmCallsLimit?: number | null;
}

export class AdminController extends BaseController {
    static logger = createLogger('AdminController');

    /** GET /api/admin/check — any authenticated user; tells the UI if it may show admin. */
    static async check(
        _request: Request,
        _env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        return AdminController.createSuccessResponse({ isAdmin: isAdmin(context.user) });
    }

    static async getStats(
        _request: Request,
        env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        if (!isAdmin(context.user)) return AdminController.createErrorResponse('Forbidden', 403);
        try {
            const stats = await new AdminService(env).getStats();
            return AdminController.createSuccessResponse({ stats });
        } catch (error) {
            this.logger.error('getStats', error);
            return AdminController.createErrorResponse('Failed to get stats', 500);
        }
    }

    static async listUsers(
        _request: Request,
        env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        if (!isAdmin(context.user)) return AdminController.createErrorResponse('Forbidden', 403);
        try {
            const users = await new AdminService(env).listAllUsers();
            return AdminController.createSuccessResponse({ users });
        } catch (error) {
            this.logger.error('listUsers', error);
            return AdminController.createErrorResponse('Failed to list users', 500);
        }
    }

    static async listApps(
        _request: Request,
        env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        if (!isAdmin(context.user)) return AdminController.createErrorResponse('Forbidden', 403);
        try {
            const apps = await new AdminService(env).listAllApps();
            return AdminController.createSuccessResponse({ apps });
        } catch (error) {
            this.logger.error('listApps', error);
            return AdminController.createErrorResponse('Failed to list apps', 500);
        }
    }

    /** GET /api/admin/users/:userId/limits — current per-user override (if any). */
    static async getUserLimits(
        _request: Request,
        env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        if (!isAdmin(context.user)) return AdminController.createErrorResponse('Forbidden', 403);
        const userId = context.pathParams.userId;
        if (!userId) return AdminController.createErrorResponse('userId required', 400);
        try {
            const raw = await env.VibecoderStore.get(`user_config:${userId}`);
            const stored = raw ? JSON.parse(raw) : null;
            const rl = stored?.security?.rateLimit ?? {};
            return AdminController.createSuccessResponse({
                userId,
                hasOverride: !!stored,
                appCreationLimit: rl.appCreation?.dailyLimit ?? rl.appCreation?.limit ?? null,
                llmCallsLimit: rl.llmCalls?.limit ?? null,
            });
        } catch (error) {
            this.logger.error('getUserLimits', error);
            return AdminController.createErrorResponse('Failed to get limits', 500);
        }
    }

    /**
     * PUT /api/admin/users/:userId/limits
     * Body: { appCreationLimit?, llmCallsLimit? } (numbers). Writes the override
     * into KV user_config:<id>. Sending neither (or nulls) clears the override.
     */
    static async setUserLimits(
        request: Request,
        env: Env,
        _ctx: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        if (!isAdmin(context.user)) return AdminController.createErrorResponse('Forbidden', 403);
        const userId = context.pathParams.userId;
        if (!userId) return AdminController.createErrorResponse('userId required', 400);
        const parsed = await AdminController.parseJsonBody<UserLimitsBody>(request);
        if (!parsed.success) return parsed.response!;
        const body = parsed.data || {};
        try {
            const rateLimit: Record<string, unknown> = {};
            if (typeof body.appCreationLimit === 'number' && body.appCreationLimit >= 0) {
                rateLimit.appCreation = { limit: body.appCreationLimit, dailyLimit: body.appCreationLimit };
            }
            if (typeof body.llmCallsLimit === 'number' && body.llmCallsLimit >= 0) {
                rateLimit.llmCalls = { limit: body.llmCallsLimit };
            }
            if (Object.keys(rateLimit).length === 0) {
                await env.VibecoderStore.delete(`user_config:${userId}`);
                return AdminController.createSuccessResponse({ userId, cleared: true });
            }
            const config = { security: { rateLimit } };
            await env.VibecoderStore.put(`user_config:${userId}`, JSON.stringify(config));
            return AdminController.createSuccessResponse({ userId, config });
        } catch (error) {
            this.logger.error('setUserLimits', error);
            return AdminController.createErrorResponse('Failed to set limits', 500);
        }
    }
}
