/**
 * Plan Service - Database operations for implementation plans (plan-store)
 */

import { BaseService } from './BaseService';
import * as schema from '../schema';
import { and, desc, eq } from 'drizzle-orm';
import { generateId } from '../../utils/idGenerator';
import type { PlanContent } from '../schema';

export type PlanStatus = 'draft' | 'approved' | 'superseded' | 'implemented' | 'archived';

export interface CreatePlanInput {
	userId: string;
	appId?: string | null;
	title: string;
	goal?: string | null;
	content?: PlanContent | null;
	status?: PlanStatus;
}

export interface UpdatePlanInput {
	title?: string;
	goal?: string | null;
	content?: PlanContent | null;
	status?: PlanStatus;
	appId?: string | null;
}

export class PlanService extends BaseService {
	/**
	 * Create a new plan (defaults to draft).
	 */
	async createPlan(input: CreatePlanInput): Promise<schema.Plan> {
		const now = new Date();
		const [plan] = await this.database
			.insert(schema.plans)
			.values({
				id: generateId(),
				userId: input.userId,
				appId: input.appId ?? null,
				title: input.title,
				goal: input.goal ?? null,
				content: input.content ?? null,
				status: input.status ?? 'draft',
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		return plan;
	}

	/**
	 * Upsert the single auto-captured (source='blueprint') plan for an app.
	 * Creates it on first capture; on later blueprint regenerations it refreshes
	 * title/goal/content while PRESERVING the plan's status (so an approved plan
	 * stays approved). Idempotent — never produces duplicate captured plans.
	 */
	async upsertBlueprintPlan(
		userId: string,
		appId: string,
		data: { title: string; goal?: string | null; content?: PlanContent | null },
	): Promise<schema.Plan> {
		const existing = await this.database
			.select()
			.from(schema.plans)
			.where(
				and(
					eq(schema.plans.appId, appId),
					eq(schema.plans.userId, userId),
					eq(schema.plans.source, 'blueprint'),
				),
			)
			.get();

		const now = new Date();
		if (existing) {
			await this.database
				.update(schema.plans)
				.set({
					title: data.title,
					goal: data.goal ?? null,
					content: data.content ?? null,
					updatedAt: now,
				})
				.where(eq(schema.plans.id, existing.id));
			const updated = await this.database
				.select()
				.from(schema.plans)
				.where(eq(schema.plans.id, existing.id))
				.get();
			return updated!;
		}

		const [plan] = await this.database
			.insert(schema.plans)
			.values({
				id: generateId(),
				userId,
				appId,
				title: data.title,
				goal: data.goal ?? null,
				content: data.content ?? null,
				status: 'draft',
				source: 'blueprint',
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		return plan;
	}

	/**
	 * List plans for a user, optionally scoped to a project (appId) and/or status.
	 */
	async listPlans(
		userId: string,
		opts: { appId?: string; status?: PlanStatus } = {},
	): Promise<schema.Plan[]> {
		const db = this.getReadDb('fresh');
		const conditions = [eq(schema.plans.userId, userId)];
		if (opts.appId) conditions.push(eq(schema.plans.appId, opts.appId));
		if (opts.status) conditions.push(eq(schema.plans.status, opts.status));
		return db
			.select()
			.from(schema.plans)
			.where(and(...conditions))
			.orderBy(desc(schema.plans.updatedAt))
			.all();
	}

	/**
	 * Get a single plan, scoped to its owner.
	 */
	async getPlan(planId: string, userId: string): Promise<schema.Plan | null> {
		const db = this.getReadDb('fresh');
		const plan = await db
			.select()
			.from(schema.plans)
			.where(and(eq(schema.plans.id, planId), eq(schema.plans.userId, userId)))
			.get();
		return plan ?? null;
	}

	/**
	 * Update a plan (owner-scoped). Returns the updated plan or null if not found/owned.
	 */
	async updatePlan(
		planId: string,
		userId: string,
		updates: UpdatePlanInput,
	): Promise<schema.Plan | null> {
		const existing = await this.getPlan(planId, userId);
		if (!existing) return null;

		const patch: Partial<typeof schema.plans.$inferInsert> = { updatedAt: new Date() };
		if (updates.title !== undefined) patch.title = updates.title;
		if (updates.goal !== undefined) patch.goal = updates.goal;
		if (updates.content !== undefined) patch.content = updates.content;
		if (updates.status !== undefined) patch.status = updates.status;
		if (updates.appId !== undefined) patch.appId = updates.appId;

		await this.database
			.update(schema.plans)
			.set(patch)
			.where(and(eq(schema.plans.id, planId), eq(schema.plans.userId, userId)));

		return this.getPlan(planId, userId);
	}

	/**
	 * Delete a plan (owner-scoped).
	 */
	async deletePlan(planId: string, userId: string): Promise<boolean> {
		const existing = await this.getPlan(planId, userId);
		if (!existing) return false;
		await this.database
			.delete(schema.plans)
			.where(and(eq(schema.plans.id, planId), eq(schema.plans.userId, userId)));
		return true;
	}
}
