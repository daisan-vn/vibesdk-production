/**
 * Deployment History Service - immutable timeline of deployment attempts per app.
 */

import { BaseService } from './BaseService';
import * as schema from '../schema';
import { and, desc, eq } from 'drizzle-orm';
import { generateId } from '../../utils/idGenerator';

export type DeploymentStatus = 'queued' | 'building' | 'ready' | 'failed';

export interface RecordDeploymentInput {
	appId: string;
	userId: string;
	status: DeploymentStatus;
	deploymentUrl?: string | null;
	deploymentId?: string | null;
	target?: string | null;
	error?: string | null;
}

export class DeploymentHistoryService extends BaseService {
	/**
	 * Record a deployment attempt. Best-effort: callers should not let a logging
	 * failure break the deploy, but we still surface errors to the caller's try/catch.
	 */
	async record(input: RecordDeploymentInput): Promise<schema.Deployment> {
		const [row] = await this.database
			.insert(schema.deployments)
			.values({
				id: generateId(),
				appId: input.appId,
				userId: input.userId,
				status: input.status,
				deploymentUrl: input.deploymentUrl ?? null,
				deploymentId: input.deploymentId ?? null,
				target: input.target ?? null,
				error: input.error ?? null,
				createdAt: new Date(),
			})
			.returning();
		return row;
	}

	/**
	 * List deployment history for an app, owner-scoped, newest first.
	 */
	async listForApp(appId: string, userId: string, limit = 25): Promise<schema.Deployment[]> {
		const db = this.getReadDb('fresh');
		return db
			.select()
			.from(schema.deployments)
			.where(and(eq(schema.deployments.appId, appId), eq(schema.deployments.userId, userId)))
			.orderBy(desc(schema.deployments.createdAt))
			.limit(limit)
			.all();
	}
}
