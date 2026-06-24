/**
 * Build & restart lifecycle instrumentation.
 *
 * Emits a small set of named, structured events through the coding-agent's
 * contextual StructuredLogger so a single build (or a single restart) can be
 * filtered out of stored observability logs by correlation fields alone —
 * without UI screenshots or multi-tenant inference.
 *
 * This module is OBSERVABILITY ONLY. It never changes control flow, persistence,
 * template selection, sandbox behaviour, timeouts, retries, or deployment. It
 * also never logs payloads: only identifiers, names, booleans, counts and
 * durations (see the redaction note on {@link LifecycleEventFields}).
 *
 * Correlation fields (agentId, projectId, sessionId, tenantId, deploymentId,
 * and the currently-known templateName/sandboxInstanceId) are attached once via
 * `logger.setFields(...)` at logger construction (see CodeGeneratorAgent.initLogger),
 * so every line — these events included — carries them automatically.
 */
import type { StructuredLogger } from '../../logger';

/** Canonical lifecycle event names. Stable strings — safe to query/alert on. */
export type LifecycleEvent =
	| 'agent_initialize_started'
	| 'template_identity_received'
	| 'template_identity_persisted'
	| 'durable_object_started'
	| 'durable_object_resumed'
	| 'ensure_template_details_started'
	| 'ensure_template_details_succeeded'
	| 'ensure_template_details_failed'
	| 'template_loaded'
	| 'blueprint_started'
	| 'code_generation_started'
	| 'sandbox_deployment_started';

/** Coarse lifecycle phase, used as the `phase` correlation field. */
export type LifecyclePhase =
	| 'initialize'
	| 'durable_object'
	| 'template_load'
	| 'blueprint'
	| 'code_generation'
	| 'sandbox_deployment';

type LifecycleLevel = 'info' | 'warn' | 'error';

/**
 * Template identity at a given point: the value handed in via initArgs and the
 * value currently persisted in durable state. Recording both makes a blank or
 * inconsistent identity self-evident in the logs.
 */
export interface TemplateIdentitySnapshot {
	/** templateName received from initArgs.templateInfo (initialize-time events). */
	receivedTemplateName?: string;
	/** templateName currently stored in durable-object state. */
	storedTemplateName?: string;
}

/**
 * Per-event fields. `phase` is required; everything else is best-effort and
 * dropped from output when undefined.
 *
 * REDACTION: callers must only pass identifiers, names, booleans, counts and
 * durations here. Never secrets, env values, tokens, cookies, prompts,
 * generated source, customer data, or template file contents.
 */
export interface LifecycleEventFields {
	phase: LifecyclePhase;
	/** Retry attempt where a real counter exists (1-based). Omitted otherwise. */
	attempt?: number;
	/** templateName as currently stored in state. */
	templateName?: string;
	/** Received-vs-stored identity; supply for template-identity events. */
	identity?: TemplateIdentitySnapshot;
	/** Additional redaction-safe scalars (cacheHit, durationMs, fileCount, ...). */
	[key: string]: unknown;
}

/**
 * Whether the template identity is usable: a non-empty stored name and — when an
 * init-supplied name is also known — consistent with it. False when blank,
 * missing, or mismatched.
 */
export function isTemplateIdentityValid(
	storedTemplateName?: string,
	receivedTemplateName?: string,
): boolean {
	const stored = (storedTemplateName ?? '').trim();
	if (!stored) return false;
	if (receivedTemplateName !== undefined) {
		const received = receivedTemplateName.trim();
		if (received && received !== stored) return false;
	}
	return true;
}

/**
 * Conventional R2 artifact key for a template name (`${name}.zip`). Derived, not
 * a stored field — provided as an observability hint. Returns undefined for the
 * pseudo-templates that have no artifact ("custom", "scratch", blank).
 */
export function templateArtifactKeyFor(templateName?: string): string | undefined {
	const name = (templateName ?? '').trim();
	if (!name || name === 'custom' || name === 'scratch') return undefined;
	return `${name}.zip`;
}

/**
 * Emit one structured lifecycle event. Correlation fields ride along via the
 * logger's setFields(); this adds the event name, the identity validity flag,
 * the received/stored identity pair, and the derived template id/artifact key.
 */
export function logLifecycleEvent(
	logger: StructuredLogger,
	event: LifecycleEvent,
	fields: LifecycleEventFields,
	level: LifecycleLevel = 'info',
): void {
	const { identity, templateName, ...rest } = fields;
	const storedName = identity?.storedTemplateName ?? templateName;

	const payload: Record<string, unknown> = {
		lifecycleEvent: event,
		templateIdentityValid: isTemplateIdentityValid(
			storedName,
			identity?.receivedTemplateName,
		),
		...rest,
	};

	if (templateName !== undefined) {
		payload.templateName = templateName;
	}
	if (storedName) {
		// No separate template id exists in the data model today; the name IS the id.
		payload.templateId = storedName;
		const artifactKey = templateArtifactKeyFor(storedName);
		if (artifactKey) payload.templateArtifactKey = artifactKey;
	}
	if (identity) {
		payload.receivedTemplateName = identity.receivedTemplateName;
		payload.storedTemplateName = identity.storedTemplateName;
	}

	logger[level](event, payload);
}
