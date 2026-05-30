import { PlansController } from '../controllers/plans/controller';
import { AppEnv } from '../../types/appenv';
import { Hono } from 'hono';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import { adaptController } from '../honoAdapter';

/**
 * Plan-store routes — real CRUD for implementation plans, owner-scoped.
 */
export function setupPlanRoutes(app: Hono<AppEnv>): void {
	app.get('/api/plans', setAuthLevel(AuthConfig.authenticated), adaptController(PlansController, PlansController.listPlans));
	app.post('/api/plans', setAuthLevel(AuthConfig.authenticated), adaptController(PlansController, PlansController.createPlan));
	app.get('/api/plans/:planId', setAuthLevel(AuthConfig.authenticated), adaptController(PlansController, PlansController.getPlan));
	app.patch('/api/plans/:planId', setAuthLevel(AuthConfig.authenticated), adaptController(PlansController, PlansController.updatePlan));
	app.delete('/api/plans/:planId', setAuthLevel(AuthConfig.authenticated), adaptController(PlansController, PlansController.deletePlan));
}
