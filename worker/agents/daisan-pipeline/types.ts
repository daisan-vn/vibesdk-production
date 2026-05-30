/**
 * Daisan 12-agent pipeline — type contracts (Phase 0 skeleton).
 *
 * STATUS: NOT WIRED into the live generation path. This file only defines the
 * interfaces for the future 12-agent orchestration described in
 * `knowledge-base/ARCHITECTURE_REWRITE_PLAN.md`. It must compile in isolation
 * and must NOT be imported by the existing engine until the rewrite reaches its
 * "enable behind flag" phase (P2). See the rewrite plan for the migration order.
 *
 * Design intent: each agent is a STEP (a class implementing `DaisanAgent`),
 * not a separate Durable Object. Steps run inside the existing CodeGeneratorAgent
 * DO and mostly WRAP existing operations (blueprint, PhaseImplementation,
 * DeepDebugger, code review, DeploymentManager) plus three new Daisan-specific
 * agents (database, search, content).
 */

/** The 12 agent roles from DAISAN_AI_AGENT_WORKFLOW.md. */
export type AgentRole =
	| 'master'
	| 'planner'
	| 'designer'
	| 'frontend'
	| 'backend'
	| 'database'
	| 'search'
	| 'content'
	| 'debug'
	| 'qa'
	| 'refactor'
	| 'deploy';

/** Minimal local shapes (kept dependency-free so this skeleton compiles standalone). */
export interface GeneratedFileRef {
	path: string;
	purpose?: string;
}

export interface PipelineIssue {
	severity: 'info' | 'warning' | 'error';
	message: string;
	file?: string;
}

export interface ProductPlan {
	goal: string;
	features: string[];
	pages: string[];
	userStories: string[];
	acceptanceCriteria: string[];
}

export interface UiSpec {
	layout: string;
	sections: string[];
	notes?: string;
}

export interface DataModelSpec {
	entities: { name: string; fields: string[] }[];
	notes?: string;
}

export interface SearchSpec {
	mapping: string; // serialized ES mapping
	facets: string[];
}

export interface ContentSpec {
	items: { field: string; value: string }[];
}

export interface AgentRunRecord {
	role: AgentRole;
	at: string; // ISO timestamp, stamped by the orchestrator
	summary: string;
}

/**
 * The shared, mutable handoff state threaded through the pipeline.
 * Each agent reads what it needs and returns a partial patch.
 */
export interface PipelineContext {
	userRequest: string;
	/** Condensed Daisan brand/business/UI/code context injected into prompts. */
	daisanContext: string;

	plan?: ProductPlan;
	design?: UiSpec;
	dataModel?: DataModelSpec;
	searchSpec?: SearchSpec;
	content?: ContentSpec;

	files: GeneratedFileRef[];
	issues: PipelineIssue[];
	qaVerdict?: 'PASS' | 'FAIL';

	history: AgentRunRecord[];
}

/** What an agent step returns: a patch to the context + a routing hint. */
export interface AgentResult {
	patch: Partial<PipelineContext>;
	nextHint?: AgentRole | 'loop' | 'done' | 'ask-user';
	log: string;
}

/** Every pipeline step implements this. `shouldRun` enables conditional agents. */
export interface DaisanAgent {
	readonly role: AgentRole;
	/** Conditional activation (e.g. database/search/content only when relevant). */
	shouldRun(ctx: PipelineContext): boolean;
	run(ctx: PipelineContext): Promise<AgentResult>;
}

/** Orchestrator contract — the state machine that routes between agents. */
export interface DaisanOrchestrator {
	run(initial: PipelineContext): Promise<PipelineContext>;
}
