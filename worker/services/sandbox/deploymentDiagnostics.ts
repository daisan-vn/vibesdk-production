/**
 * Post-generation deploy/sandbox diagnostic instrumentation (P3).
 *
 * OBSERVABILITY ONLY. This module changes no control flow, commands, timeouts,
 * retries, ports, health-check, exposePort, template, or persistence behavior.
 *
 * It exists to close the P3 gap that the sandbox layer logs without per-build
 * correlation. A single immutable {@link DeployCorrelation} object is built once
 * (in DeploymentManager) and passed EXPLICITLY down the deploy chain — it is NOT
 * read from mutable logger.setFields() state — so every diagnostic event for one
 * build can be filtered from stored observability by agentId/sessionId alone.
 *
 * REDACTION: callers pass only identifiers, names, numbers, booleans and bounded
 * command-output tails. Never prompts, source code, template contents, secrets,
 * environment values, tokens, cookies, or customer data. {@link boundedRedactedTail}
 * is a defense-in-depth bound + scrub on the only free-text fields (stdout/stderr).
 */
import type { StructuredLogger } from '../../logger';

const NA = 'not_available';

/**
 * Immutable correlation threaded through deployToSandbox → DeploymentManager →
 * BaseSandboxService → SandboxSdkClient → createInstance → setupInstance →
 * writeFilesBulk → provisionTemplateResources → install → startDevServer →
 * waitForServerReady → exposePort. Refined immutably as new ids become known.
 */
export interface DeployCorrelation {
	readonly agentId: string;
	readonly projectId: string;
	readonly sessionId: string;
	/** No distinct build id exists in the data model yet; aliased to the deploy sessionId. */
	readonly buildId: string;
	readonly templateName: string;
	readonly workerDeploymentId: string;
	/** Known only after the sandbox instance is created. */
	readonly sandboxInstanceId?: string;
	/** Known only inside the deploy retry loop. */
	readonly deploymentAttempt?: number;
}

/** Build the base correlation. Unavailable values become explicit 'not_available'. */
export function makeDeployCorrelation(input: {
	agentId?: string;
	sessionId?: string;
	templateName?: string;
	workerDeploymentId?: string;
}): DeployCorrelation {
	const agentId = input.agentId || NA;
	const sessionId = input.sessionId || NA;
	return {
		agentId,
		projectId: agentId, // project == agent/DO id in this architecture
		sessionId,
		buildId: sessionId, // aliased: no separate build id yet (durable build-state, future)
		templateName: input.templateName || NA,
		workerDeploymentId: input.workerDeploymentId || NA,
	};
}

/** Immutable refinement once the sandbox instance id is known. */
export function withSandboxInstance(c: DeployCorrelation, sandboxInstanceId: string): DeployCorrelation {
	return { ...c, sandboxInstanceId };
}

/** Immutable refinement with the current deploy attempt (1-based). */
export function withDeploymentAttempt(c: DeployCorrelation, deploymentAttempt: number): DeployCorrelation {
	return { ...c, deploymentAttempt };
}

/** Worker deployment/version id from the CF_VERSION_METADATA binding. */
export function readWorkerDeploymentId(env: unknown): string {
	const meta = (env as { CF_VERSION_METADATA?: { id?: string; tag?: string } } | undefined)?.CF_VERSION_METADATA;
	return meta?.id ?? meta?.tag ?? NA;
}

export type DeployDiagnosticEvent =
	| 'code_generation_completed'
	| 'source_preparation_started' | 'source_preparation_completed' | 'source_preparation_failed'
	| 'source_transfer_started' | 'source_transfer_completed' | 'source_transfer_failed'
	| 'sandbox_provisioning_started' | 'sandbox_provisioning_completed' | 'sandbox_provisioning_failed'
	| 'template_resources_started' | 'template_resources_completed' | 'template_resources_failed'
	| 'dependency_install_started' | 'dependency_install_completed' | 'dependency_install_failed'
	| 'preview_command_resolved'
	| 'preview_process_started' | 'preview_process_exited' | 'preview_process_failed'
	| 'health_check_started' | 'health_check_succeeded' | 'health_check_failed'
	| 'internal_port_check_started' | 'internal_port_ready' | 'internal_port_failed'
	| 'port_exposure_started' | 'port_exposure_completed' | 'port_exposure_failed'
	| 'preview_ready';

/** Per-event fields. All optional; undefined is dropped from output. */
export interface DeployEventFields {
	phase?: string;
	command?: string;
	elapsedMs?: number;
	timeoutMs?: number;
	attempt?: number;
	exitCode?: number;
	processAlive?: boolean;
	expectedPort?: number;
	checkedPort?: number;
	stdoutTail?: string;
	stderrTail?: string;
	/** Additional redaction-safe scalars (counts, bytes, booleans, durations). */
	[key: string]: unknown;
}

const MAX_TAIL = 600;

/**
 * Bound a command-output tail to the last `maxLen` chars (errors cluster at the
 * end) and scrub obvious secret-bearing tokens as defense-in-depth. Install/build
 * output should never carry secrets; callers must still not pass source/prompts.
 */
export function boundedRedactedTail(s: string | undefined, maxLen: number = MAX_TAIL): string | undefined {
	if (s === undefined || s === null) return undefined;
	let out = s.length > maxLen ? s.slice(-maxLen) : s;
	out = out
		.replace(/(authorization|bearer|token|api[_-]?key|secret|password|cookie)\s*[:=]\s*\S+/gi, '$1=[REDACTED]')
		.replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g, '[REDACTED_JWT]');
	return out;
}

/**
 * Emit one structured deploy/sandbox diagnostic event with explicit correlation.
 * Correlation rides on the passed object (always present in output, 'not_available'
 * when a field is unknown), independent of any mutable logger context.
 */
export function logDeployEvent(
	logger: StructuredLogger,
	correlation: DeployCorrelation | undefined,
	event: DeployDiagnosticEvent,
	fields: DeployEventFields = {},
	level: 'info' | 'warn' | 'error' = 'info',
): void {
	const c = correlation;
	const { stdoutTail, stderrTail, ...rest } = fields;
	logger[level](event, {
		deployEvent: event,
		agentId: c?.agentId ?? NA,
		projectId: c?.projectId ?? NA,
		sessionId: c?.sessionId ?? NA,
		buildId: c?.buildId ?? NA,
		templateName: c?.templateName ?? NA,
		sandboxInstanceId: c?.sandboxInstanceId ?? NA,
		deploymentAttempt: c?.deploymentAttempt ?? NA,
		workerDeploymentId: c?.workerDeploymentId ?? NA,
		...rest,
		...(stdoutTail !== undefined ? { stdoutTail: boundedRedactedTail(stdoutTail) } : {}),
		...(stderrTail !== undefined ? { stderrTail: boundedRedactedTail(stderrTail) } : {}),
	});
}
