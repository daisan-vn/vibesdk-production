import { AdvisoryController } from '../controllers/advisory/controller';
import { AppEnv } from '../../types/appenv';
import { Hono } from 'hono';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import { adaptController } from '../honoAdapter';

/**
 * Advisory route — conversational Q&A / consult / plan / learn / review.
 * Does not bootstrap a project; powers the non-Build work modes.
 */
export function setupAdvisoryRoutes(app: Hono<AppEnv>): void {
	app.post('/api/advisory', setAuthLevel(AuthConfig.authenticated), adaptController(AdvisoryController, AdvisoryController.chat));
}
