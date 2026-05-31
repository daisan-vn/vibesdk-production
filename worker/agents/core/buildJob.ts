/**
 * Build-job state machine — the single source of truth for whether a Daisan
 * build is actually progressing, deployable, or done.
 *
 * Persisted server-side (inside the Durable Object agent state) so that a
 * WebSocket reconnect or a browser refresh can refetch the canonical state and
 * reconcile the UI, instead of trusting ephemeral frontend flags. This is what
 * fixes the "0/1 phases → Done" false-completion bug: `done` is GUARDED and can
 * only be entered when at least one phase completed AND the app is deployable.
 */

export type BuildJobState =
	| 'queued'
	| 'analyzing'
	| 'needs_clarification'
	| 'awaiting_approval'
	| 'planning'
	| 'blueprint_ready'
	| 'generating_code'
	| 'installing_dependencies'
	| 'preview_starting'
	| 'preview_ready'
	| 'deployable'
	| 'done'
	| 'failed'
	| 'aborted'
	| 'reconnecting';

/** Forward progression order (used for "is this a forward step" checks). */
export const BUILD_PROGRESS_ORDER: BuildJobState[] = [
	'queued',
	'analyzing',
	'planning',
	'blueprint_ready',
	'awaiting_approval',
	'generating_code',
	'installing_dependencies',
	'preview_starting',
	'preview_ready',
	'deployable',
	'done',
];

/** Terminal states — a job in one of these is not actively progressing. */
const TERMINAL: ReadonlySet<BuildJobState> = new Set(['done', 'failed', 'aborted']);

/** Control states reachable from anywhere (failure / abort / connection loss). */
const CONTROL: ReadonlySet<BuildJobState> = new Set(['failed', 'aborted', 'reconnecting']);

export interface BuildPhaseRecord {
	state: BuildJobState;
	at: number;
	note?: string;
}

export interface BuildErrorRecord {
	at: number;
	state: BuildJobState;
	message: string;
}

export interface BuildJob {
	state: BuildJobState;
	/** Ordered history of every transition (for debugging false-Done states). */
	phaseHistory: BuildPhaseRecord[];
	/** Errors captured during the build. */
	errors: BuildErrorRecord[];
	/** createdAt/updatedAt + first-entered timestamp per state. */
	timestamps: Record<string, number>;
	/** Count of files generated so far. */
	filesGenerated: number;
	/** Number of phases that actually completed. */
	completedPhases: number;
	/** Planned/required total phases (from blueprint roadmap; >=1). */
	requiredPhasesTotal: number;
	/** How many times this job has been retried. */
	retryCount: number;
	/** True only when the generated app can actually be deployed. */
	deployable: boolean;
	/** Timestamp of the last transition — drives per-phase timeout. */
	lastTransitionAt: number;
	/** The state we were in before entering `reconnecting` (to resume). */
	resumeState?: BuildJobState;
	lastError?: string;
}

/**
 * Per-state timeout (ms). If a working state exceeds this without any
 * transition, the job is marked `failed` with a retryable error.
 */
export const PHASE_TIMEOUTS: Partial<Record<BuildJobState, number>> = {
	queued: 60_000,
	analyzing: 120_000,
	planning: 180_000,
	blueprint_ready: 120_000,
	generating_code: 600_000, // a phase can legitimately take a while
	installing_dependencies: 240_000,
	preview_starting: 180_000,
	preview_ready: 120_000,
};

export function isTerminalState(state: BuildJobState): boolean {
	return TERMINAL.has(state);
}

export function isWorkingState(state: BuildJobState): boolean {
	return (
		!TERMINAL.has(state) &&
		state !== 'reconnecting' &&
		state !== 'queued' &&
		state !== 'needs_clarification' &&
		state !== 'awaiting_approval'
	);
}

export type BuildLogFn = (
	level: 'info' | 'warn' | 'error',
	message: string,
	data?: Record<string, unknown>,
) => void;

export function createBuildJob(now: number): BuildJob {
	return {
		state: 'queued',
		phaseHistory: [{ state: 'queued', at: now }],
		errors: [],
		timestamps: { createdAt: now, updatedAt: now, queued: now },
		filesGenerated: 0,
		completedPhases: 0,
		requiredPhasesTotal: 1,
		retryCount: 0,
		deployable: false,
		lastTransitionAt: now,
	};
}

/**
 * Allowed forward/backward transitions between WORKING/progress states.
 * Control states (failed/aborted/reconnecting) are always allowed and handled
 * separately. `done` is additionally guarded by `canMarkDone`.
 */
const ALLOWED: Record<BuildJobState, BuildJobState[]> = {
	queued: ['analyzing', 'planning'],
	analyzing: ['needs_clarification', 'planning', 'blueprint_ready', 'generating_code', 'awaiting_approval'],
	needs_clarification: ['analyzing', 'planning', 'blueprint_ready', 'generating_code'],
	awaiting_approval: ['analyzing', 'planning', 'blueprint_ready', 'generating_code'],
	planning: ['needs_clarification', 'blueprint_ready', 'generating_code', 'analyzing', 'awaiting_approval'],
	blueprint_ready: ['needs_clarification', 'generating_code', 'awaiting_approval'],
	generating_code: [
		'generating_code',
		'installing_dependencies',
		'preview_starting',
		'preview_ready',
		'deployable',
		'done',
	],
	installing_dependencies: ['generating_code', 'preview_starting', 'preview_ready'],
	preview_starting: ['preview_ready', 'generating_code', 'deployable'],
	preview_ready: ['deployable', 'generating_code', 'done'],
	deployable: ['done', 'generating_code', 'preview_starting', 'installing_dependencies'],
	done: ['generating_code', 'planning'],
	// from control states we resume into working states
	failed: ['queued', 'analyzing', 'planning', 'generating_code'],
	aborted: ['queued', 'analyzing', 'planning', 'generating_code'],
	reconnecting: BUILD_PROGRESS_ORDER.concat(['reconnecting']),
};

export function canTransition(from: BuildJobState, to: BuildJobState): boolean {
	if (CONTROL.has(to)) return true; // can always fail / abort / drop connection
	if (from === to && to === 'generating_code') return true; // phase progress updates
	return (ALLOWED[from] ?? []).includes(to);
}

/** The critical guard: never mark done unless real work completed + deployable. */
export function canMarkDone(job: BuildJob): boolean {
	return job.completedPhases > 0 && job.deployable;
}

export interface TransitionOpts {
	note?: string;
	error?: string;
	/** Partial metadata to merge (completedPhases, filesGenerated, etc.). */
	patch?: Partial<
		Pick<
			BuildJob,
			'filesGenerated' | 'completedPhases' | 'requiredPhasesTotal' | 'deployable' | 'retryCount'
		>
	>;
	log?: BuildLogFn;
}

/**
 * Apply a transition, enforcing the done-guard and logging every change.
 * Always returns a NEW job object (never mutates the input).
 */
export function transition(
	job: BuildJob,
	to: BuildJobState,
	now: number,
	opts: TransitionOpts = {},
): BuildJob {
	const { note, error, patch, log } = opts;
	const from = job.state;

	// Merge metadata first so guards see the latest counts.
	const next: BuildJob = {
		...job,
		...patch,
		errors: [...job.errors],
		phaseHistory: [...job.phaseHistory],
		timestamps: { ...job.timestamps },
	};

	let target = to;

	// GUARD: done requires real completed work + deployability.
	if (target === 'done' && !canMarkDone(next)) {
		const reason = `Refusing done: completedPhases=${next.completedPhases}, deployable=${next.deployable}`;
		log?.('error', `[buildJob] ${reason}`, { from, requiredPhasesTotal: next.requiredPhasesTotal });
		next.errors.push({ at: now, state: from, message: reason });
		next.lastError = reason;
		target = 'failed';
	} else if (!canTransition(from, target) && !CONTROL.has(target)) {
		// Unexpected order — log loudly but apply (be permissive so a live build
		// never freezes on an out-of-order event), except `done` which is guarded above.
		log?.('warn', `[buildJob] unexpected transition ${from} -> ${target} (applying anyway)`, {});
	}

	const changed = target !== from || target === 'generating_code';
	next.state = target;
	next.lastTransitionAt = now;
	next.timestamps.updatedAt = now;
	if (next.timestamps[target] === undefined) next.timestamps[target] = now;

	if (error) {
		next.errors.push({ at: now, state: target, message: error });
		next.lastError = error;
	}

	if (changed || note) {
		next.phaseHistory.push({ state: target, at: now, note });
	}

	log?.('info', `[buildJob] ${from} -> ${target}`, {
		completedPhases: next.completedPhases,
		requiredPhasesTotal: next.requiredPhasesTotal,
		deployable: next.deployable,
		filesGenerated: next.filesGenerated,
		note,
	});

	return next;
}

/**
 * Mark the connection as lost. Stores the current working state so we can
 * resume after reconnect without auto-advancing the phase.
 */
export function markReconnecting(job: BuildJob, now: number, log?: BuildLogFn): BuildJob {
	if (job.state === 'reconnecting' || isTerminalState(job.state)) return job;
	const resumeState = job.state;
	const next = transition(job, 'reconnecting', now, { note: `lost connection during ${resumeState}`, log });
	next.resumeState = resumeState;
	return next;
}

/**
 * Lazy per-phase timeout check. If the current working state has exceeded its
 * timeout, returns a `failed` job (retryable). Otherwise returns null.
 */
export function checkTimeout(job: BuildJob, now: number, log?: BuildLogFn): BuildJob | null {
	if (isTerminalState(job.state) || job.state === 'reconnecting') return null;
	const limit = PHASE_TIMEOUTS[job.state];
	if (!limit) return null;
	const elapsed = now - job.lastTransitionAt;
	if (elapsed <= limit) return null;
	const message = `Phase "${job.state}" timed out after ${Math.round(elapsed / 1000)}s`;
	log?.('error', `[buildJob] ${message}`, {});
	return transition(job, 'failed', now, { error: message, log });
}

/**
 * Map an outgoing WebSocket message type to a build-job transition. This is the
 * ONE place that derives canonical build state from pipeline events, so every
 * existing broadcast point feeds the state machine without rewiring the engine.
 *
 * Returns a new job (or the same reference if nothing changed).
 */
export function applyMessageToBuildJob(
	job: BuildJob,
	type: string,
	now: number,
	opts: { requiredPhasesTotal?: number; planMode?: boolean; log?: BuildLogFn } = {},
): BuildJob {
	const { requiredPhasesTotal, planMode, log } = opts;
	const t = (to: BuildJobState, extra?: TransitionOpts) =>
		transition(job, to, now, { ...extra, log });

	switch (type) {
		case 'generation_started': {
			// A fresh full (re)build: reset progress counters so a previous run's
			// completedPhases/deployable can't leak into the new job.
			if (
				job.state === 'queued' ||
				job.state === 'reconnecting' ||
				job.state === 'awaiting_approval' ||
				isTerminalState(job.state)
			) {
				const fresh = createBuildJob(now);
				fresh.retryCount = job.retryCount;
				// First visible step: analyzing the request before any blueprint/code.
				return transition(fresh, 'analyzing', now, { note: 'analyzing request', log });
			}
			return job;
		}
		case 'blueprint_updated':
		case 'blueprint_chunk':
			return job.state === 'analyzing' || job.state === 'planning' || job.state === 'queued'
				? t('blueprint_ready', { note: 'blueprint available' })
				: job;
		case 'phase_generating':
		case 'phase_generated':
		case 'phase_implementing':
			return t('generating_code', {
				note: type,
				patch: requiredPhasesTotal ? { requiredPhasesTotal } : undefined,
			});
		case 'phase_validating':
			return job; // still within generating_code; no state change
		case 'phase_implemented':
			// A real phase finished → bump count and become deployable.
			return transition(job, 'generating_code', now, {
				note: 'phase implemented',
				patch: {
					completedPhases: job.completedPhases + 1,
					deployable: true,
					requiredPhasesTotal: Math.max(
						requiredPhasesTotal ?? 0,
						job.requiredPhasesTotal,
						job.completedPhases + 1,
					),
				},
				log,
			});
		case 'file_generated':
		case 'file_regenerated':
			// High-frequency: bump file count + keep-alive (reset timeout) WITHOUT
			// spamming phaseHistory.
			return {
				...job,
				filesGenerated: job.filesGenerated + 1,
				lastTransitionAt: now,
				timestamps: { ...job.timestamps, updatedAt: now },
			};
		case 'command_executing':
			return job.state === 'generating_code' || job.state === 'blueprint_ready'
				? t('installing_dependencies', { note: 'running setup commands' })
				: job;
		case 'deployment_started':
			return t('preview_starting', { note: 'preview deploy started' });
		case 'deployment_completed':
			return transition(job, 'preview_ready', now, {
				note: 'preview ready',
				patch: { deployable: job.completedPhases > 0 },
				log,
			});
		case 'generation_complete':
			// Plan mode legitimately produces NO code phases — the "completion" is
			// just the plan being ready, not a deployable build. Do not attempt
			// `done` (which would fail the guard) and do not mark failed.
			if (planMode) {
				log?.('info', '[buildJob] generation_complete in plan mode - plan ready, not done', {});
				return t('awaiting_approval', { note: 'plan ready (plan mode)' });
			}
			// GUARDED: transition() downgrades to `failed` if not deployable / 0 phases.
			return t('done', { note: 'generation complete signal received' });
		case 'generation_stopped':
			return t('aborted', { note: 'generation stopped by user' });
		case 'generation_resumed':
			return t('generating_code', { note: 'generation resumed' });
		case 'deployment_failed':
		case 'cloudflare_deployment_error':
			return t(job.state, { error: 'deployment failed' });
		case 'error':
		case 'rate_limit_error':
			// Record but don't fail — many errors are recoverable mid-build.
			return t(job.state, { error: `pipeline error (${type})` });
		default:
			return job;
	}
}

/** Begin a retry from a failed/aborted job. */
export function retry(job: BuildJob, now: number, log?: BuildLogFn): BuildJob {
	const next = transition(job, 'planning', now, {
		note: 'retry requested',
		patch: { retryCount: job.retryCount + 1 },
		log,
	});
	return next;
}
