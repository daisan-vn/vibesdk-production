/**
 * Admin Routes
 * Platform admin panel: list users/apps, edit per-user rate limits.
 * Routes require `authenticated`; AdminController enforces the admin allowlist.
 */

import { Hono } from 'hono';
import { AppEnv } from '../../types/appenv';
import { adaptController } from '../honoAdapter';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import { AdminController } from '../controllers/admin/controller';

export function setupAdminRoutes(app: Hono<AppEnv>): void {
    app.get('/api/admin/check', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.check));
    app.get('/api/admin/stats', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.getStats));
    app.get('/api/admin/users', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.listUsers));
    app.get('/api/admin/apps', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.listApps));
    app.get('/api/admin/users/:userId/limits', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.getUserLimits));
    app.put('/api/admin/users/:userId/limits', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.setUserLimits));
}
