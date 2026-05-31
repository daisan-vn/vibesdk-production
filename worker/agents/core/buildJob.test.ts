import { describe, it, expect } from 'vitest';
import {
	createBuildJob,
	transition,
	applyMessageToBuildJob,
	markReconnecting,
	checkTimeout,
	retry,
	canMarkDone,
	isTerminalState,
	PHASE_TIMEOUTS,
	type BuildJob,
} from './buildJob';

// Deterministic clock helper
let clock = 1_000;
const tick = (ms = 1000) => (clock += ms);

function feed(job: BuildJob, type: string, opts?: { requiredPhasesTotal?: number }): BuildJob {
	return applyMessageToBuildJob(job, type, tick(), opts);
}

describe('buildJob state machine', () => {
	it('starts queued with sane defaults', () => {
		const job = createBuildJob(0);
		expect(job.state).toBe('queued');
		expect(job.completedPhases).toBe(0);
		expect(job.deployable).toBe(false);
		expect(job.requiredPhasesTotal).toBe(1);
		expect(job.phaseHistory).toHaveLength(1);
	});

	it('runs the happy path to done', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		expect(job.state).toBe('planning');
		job = feed(job, 'blueprint_updated');
		expect(job.state).toBe('blueprint_ready');
		job = feed(job, 'phase_implementing', { requiredPhasesTotal: 1 });
		expect(job.state).toBe('generating_code');
		job = feed(job, 'phase_implemented');
		expect(job.completedPhases).toBe(1);
		expect(job.deployable).toBe(true);
		job = feed(job, 'deployment_started');
		expect(job.state).toBe('preview_starting');
		job = feed(job, 'deployment_completed');
		expect(job.state).toBe('preview_ready');
		job = feed(job, 'generation_complete');
		expect(job.state).toBe('done');
	});

	// THE BUG: generation_complete with 0 phases must NEVER be done.
	it('never marks done when 0 phases completed (the 0/1 false-Done bug)', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		job = feed(job, 'generation_complete'); // arrives with completedPhases=0
		expect(job.state).not.toBe('done');
		expect(job.state).toBe('failed');
		expect(job.lastError).toMatch(/completedPhases=0/);
	});

	it('never marks done when phases done but not deployable', () => {
		let job = createBuildJob(clock);
		// Force a completed phase but no deployability
		job = transition(job, 'generating_code', tick(), { patch: { completedPhases: 1, deployable: false } });
		expect(canMarkDone(job)).toBe(false);
		job = transition(job, 'done', tick());
		expect(job.state).toBe('failed');
	});

	it('marks done only when phases>0 AND deployable', () => {
		let job = createBuildJob(clock);
		job = transition(job, 'generating_code', tick(), { patch: { completedPhases: 2, deployable: true } });
		expect(canMarkDone(job)).toBe(true);
		job = transition(job, 'done', tick());
		expect(job.state).toBe('done');
	});

	it('aborts cleanly on stop', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		job = feed(job, 'phase_implementing');
		job = feed(job, 'generation_stopped');
		expect(job.state).toBe('aborted');
		expect(isTerminalState(job.state)).toBe(true);
	});

	it('reconnecting preserves resume state and does not advance', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		job = feed(job, 'phase_implementing');
		expect(job.state).toBe('generating_code');
		job = markReconnecting(job, tick());
		expect(job.state).toBe('reconnecting');
		expect(job.resumeState).toBe('generating_code');
	});

	it('does not enter reconnecting from a terminal state', () => {
		let job = createBuildJob(clock);
		job = transition(job, 'generating_code', tick(), { patch: { completedPhases: 1, deployable: true } });
		job = transition(job, 'done', tick());
		const same = markReconnecting(job, tick());
		expect(same.state).toBe('done');
	});

	it('times out a stalled phase into failed', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started'); // planning
		const limit = PHASE_TIMEOUTS.planning!;
		const timedOut = checkTimeout(job, job.lastTransitionAt + limit + 1);
		expect(timedOut).not.toBeNull();
		expect(timedOut!.state).toBe('failed');
		expect(timedOut!.lastError).toMatch(/timed out/);
	});

	it('does not time out within the limit', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		const within = checkTimeout(job, job.lastTransitionAt + 1000);
		expect(within).toBeNull();
	});

	it('counts files without spamming phase history', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		job = feed(job, 'phase_implementing');
		const historyLen = job.phaseHistory.length;
		job = feed(job, 'file_generated');
		job = feed(job, 'file_generated');
		job = feed(job, 'file_generated');
		expect(job.filesGenerated).toBe(3);
		expect(job.phaseHistory.length).toBe(historyLen); // no new history entries
	});

	it('retry increments retryCount and re-enters planning', () => {
		let job = createBuildJob(clock);
		job = feed(job, 'generation_started');
		job = feed(job, 'generation_complete'); // -> failed (0 phases)
		expect(job.state).toBe('failed');
		job = retry(job, tick());
		expect(job.state).toBe('planning');
		expect(job.retryCount).toBe(1);
	});

	it('plan mode: generation_complete with 0 phases is NOT failed (plan ready)', () => {
		let job = createBuildJob(clock);
		job = applyMessageToBuildJob(job, 'generation_started', tick(), { planMode: true });
		job = applyMessageToBuildJob(job, 'blueprint_updated', tick(), { planMode: true });
		expect(job.state).toBe('blueprint_ready');
		job = applyMessageToBuildJob(job, 'generation_complete', tick(), { planMode: true });
		expect(job.state).not.toBe('failed');
		expect(job.state).not.toBe('done');
		expect(job.state).toBe('blueprint_ready');
	});

	it('logs every transition through the provided logger', () => {
		const logs: string[] = [];
		const log = (_l: string, m: string) => logs.push(m);
		let job = createBuildJob(clock);
		job = transition(job, 'planning', tick(), { log });
		job = transition(job, 'blueprint_ready', tick(), { log });
		expect(logs.some((m) => m.includes('queued -> planning'))).toBe(true);
		expect(logs.some((m) => m.includes('planning -> blueprint_ready'))).toBe(true);
	});
});
