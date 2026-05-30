/**
 * Daisan 12-agent orchestrator — Phase 0 STUB.
 *
 * NOT WIRED into the live path. This is a compiling placeholder that documents
 * the intended routing (see knowledge-base/ARCHITECTURE_REWRITE_PLAN.md §2.3).
 * It throws if invoked so it can never silently run in production. Real
 * implementation lands in P2 behind the `DAISAN_PIPELINE` flag.
 */

import type { AgentRole, DaisanOrchestrator, PipelineContext } from './types';

/** Intended default routing order; conditional agents gated by `shouldRun`. */
export const DEFAULT_AGENT_ORDER: AgentRole[] = [
	'master',
	'planner',
	'designer',
	'database',
	'search',
	'content',
	'frontend',
	'backend',
	'debug',
	'qa',
	'deploy',
];

export class DaisanPipelineOrchestratorStub implements DaisanOrchestrator {
	async run(_initial: PipelineContext): Promise<PipelineContext> {
		// Guard: this stub must never execute in production. Wiring happens at P2.
		throw new Error(
			'DaisanPipelineOrchestrator is not implemented yet (Phase 0 skeleton). ' +
				'See knowledge-base/ARCHITECTURE_REWRITE_PLAN.md for the migration plan.',
		);
	}
}
