import type { PlanContent } from '../../../database/schema';

export type { PlanContent };

export type PlanStatus = 'draft' | 'approved' | 'superseded' | 'implemented' | 'archived';

export type PlanSource = 'manual' | 'blueprint';

export const PLAN_STATUSES: PlanStatus[] = [
	'draft',
	'approved',
	'superseded',
	'implemented',
	'archived',
];

/** API representation of a plan (timestamps serialized to ISO strings). */
export interface PlanData {
	id: string;
	userId: string | null;
	appId: string | null;
	title: string;
	status: PlanStatus;
	source: PlanSource;
	goal: string | null;
	content: PlanContent | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface PlanListData {
	plans: PlanData[];
}

export interface CreatePlanRequest {
	title: string;
	appId?: string | null;
	goal?: string | null;
	content?: PlanContent | null;
	status?: PlanStatus;
}

export interface UpdatePlanRequest {
	title?: string;
	appId?: string | null;
	goal?: string | null;
	content?: PlanContent | null;
	status?: PlanStatus;
}
