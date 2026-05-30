import { BaseController } from '../baseController';
import { ApiResponse, ControllerResponse } from '../types';
import { RouteContext } from '../../types/route-context';
import { PlanService } from '../../../database';
import type { Plan } from '../../../database/schema';
import {
	CreatePlanRequest,
	PlanData,
	PlanListData,
	PlanStatus,
	PLAN_STATUSES,
	UpdatePlanRequest,
} from './types';

/**
 * Plans controller - real plan-store CRUD, owner-scoped.
 */
export class PlansController extends BaseController {
	private static toData(plan: Plan): PlanData {
		return {
			id: plan.id,
			userId: plan.userId ?? null,
			appId: plan.appId ?? null,
			title: plan.title,
			status: plan.status as PlanStatus,
			source: (plan.source as PlanData['source']) ?? 'manual',
			goal: plan.goal ?? null,
			content: plan.content ?? null,
			createdAt: plan.createdAt ? new Date(plan.createdAt).toISOString() : null,
			updatedAt: plan.updatedAt ? new Date(plan.updatedAt).toISOString() : null,
		};
	}

	static async listPlans(
		request: Request,
		env: Env,
		_: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<PlanListData>>> {
		try {
			const userId = context.user?.id;
			if (!userId) return PlansController.createErrorResponse<PlanListData>('Unauthorized', 401);

			const params = new URL(request.url).searchParams;
			const appId = params.get('appId') || undefined;
			const statusParam = params.get('status') || undefined;
			const status =
				statusParam && PLAN_STATUSES.includes(statusParam as PlanStatus)
					? (statusParam as PlanStatus)
					: undefined;

			const service = new PlanService(env);
			const plans = await service.listPlans(userId, { appId, status });
			return PlansController.createSuccessResponse<PlanListData>({
				plans: plans.map(PlansController.toData),
			});
		} catch (error) {
			return PlansController.handleError(error, 'list plans') as ControllerResponse<ApiResponse<PlanListData>>;
		}
	}

	static async createPlan(
		request: Request,
		env: Env,
		_: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<PlanData>>> {
		try {
			const userId = context.user?.id;
			if (!userId) return PlansController.createErrorResponse<PlanData>('Unauthorized', 401);

			let body: CreatePlanRequest;
			try {
				body = (await request.json()) as CreatePlanRequest;
			} catch {
				return PlansController.createErrorResponse<PlanData>('Invalid JSON body', 400);
			}

			if (!body.title || !body.title.trim()) {
				return PlansController.createErrorResponse<PlanData>('Plan title is required', 400);
			}
			if (body.status && !PLAN_STATUSES.includes(body.status)) {
				return PlansController.createErrorResponse<PlanData>('Invalid plan status', 400);
			}

			const service = new PlanService(env);
			const plan = await service.createPlan({
				userId,
				appId: body.appId ?? null,
				title: body.title.trim(),
				goal: body.goal ?? null,
				content: body.content ?? null,
				status: body.status,
			});
			return PlansController.createSuccessResponse<PlanData>(PlansController.toData(plan));
		} catch (error) {
			return PlansController.handleError(error, 'create plan') as ControllerResponse<ApiResponse<PlanData>>;
		}
	}

	static async getPlan(
		_request: Request,
		env: Env,
		_: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<PlanData>>> {
		try {
			const userId = context.user?.id;
			if (!userId) return PlansController.createErrorResponse<PlanData>('Unauthorized', 401);
			const planId = context.pathParams.planId;
			if (!planId) return PlansController.createErrorResponse<PlanData>('Missing plan ID', 400);

			const service = new PlanService(env);
			const plan = await service.getPlan(planId, userId);
			if (!plan) return PlansController.createErrorResponse<PlanData>('Plan not found', 404);
			return PlansController.createSuccessResponse<PlanData>(PlansController.toData(plan));
		} catch (error) {
			return PlansController.handleError(error, 'get plan') as ControllerResponse<ApiResponse<PlanData>>;
		}
	}

	static async updatePlan(
		request: Request,
		env: Env,
		_: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<PlanData>>> {
		try {
			const userId = context.user?.id;
			if (!userId) return PlansController.createErrorResponse<PlanData>('Unauthorized', 401);
			const planId = context.pathParams.planId;
			if (!planId) return PlansController.createErrorResponse<PlanData>('Missing plan ID', 400);

			let body: UpdatePlanRequest;
			try {
				body = (await request.json()) as UpdatePlanRequest;
			} catch {
				return PlansController.createErrorResponse<PlanData>('Invalid JSON body', 400);
			}
			if (body.status && !PLAN_STATUSES.includes(body.status)) {
				return PlansController.createErrorResponse<PlanData>('Invalid plan status', 400);
			}
			if (body.title !== undefined && !body.title.trim()) {
				return PlansController.createErrorResponse<PlanData>('Plan title cannot be empty', 400);
			}

			const service = new PlanService(env);
			const updated = await service.updatePlan(planId, userId, {
				title: body.title?.trim(),
				goal: body.goal,
				content: body.content,
				status: body.status,
				appId: body.appId,
			});
			if (!updated) return PlansController.createErrorResponse<PlanData>('Plan not found', 404);
			return PlansController.createSuccessResponse<PlanData>(PlansController.toData(updated));
		} catch (error) {
			return PlansController.handleError(error, 'update plan') as ControllerResponse<ApiResponse<PlanData>>;
		}
	}

	static async deletePlan(
		_request: Request,
		env: Env,
		_: ExecutionContext,
		context: RouteContext,
	): Promise<ControllerResponse<ApiResponse<{ deleted: boolean }>>> {
		try {
			const userId = context.user?.id;
			if (!userId) return PlansController.createErrorResponse<{ deleted: boolean }>('Unauthorized', 401);
			const planId = context.pathParams.planId;
			if (!planId) return PlansController.createErrorResponse<{ deleted: boolean }>('Missing plan ID', 400);

			const service = new PlanService(env);
			const ok = await service.deletePlan(planId, userId);
			if (!ok) return PlansController.createErrorResponse<{ deleted: boolean }>('Plan not found', 404);
			return PlansController.createSuccessResponse<{ deleted: boolean }>({ deleted: true });
		} catch (error) {
			return PlansController.handleError(error, 'delete plan') as ControllerResponse<ApiResponse<{ deleted: boolean }>>;
		}
	}
}
