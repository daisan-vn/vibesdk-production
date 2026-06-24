import { describe, it, expect } from 'vitest';
import type { StructuredLogger } from '../../logger';
import {
	makeDeployCorrelation,
	withSandboxInstance,
	withDeploymentAttempt,
	readWorkerDeploymentId,
	boundedRedactedTail,
	logDeployEvent,
} from './deploymentDiagnostics';

type Captured = { level: string; message: string; payload: Record<string, unknown> };

function makeFakeLogger(): { logger: StructuredLogger; calls: Captured[] } {
	const calls: Captured[] = [];
	const record = (level: string) => (message: string, payload?: Record<string, unknown>) =>
		calls.push({ level, message, payload: payload ?? {} });
	const logger = { info: record('info'), warn: record('warn'), error: record('error') } as unknown as StructuredLogger;
	return { logger, calls };
}

describe('makeDeployCorrelation', () => {
	it('aliases projectId=agentId and buildId=sessionId', () => {
		const c = makeDeployCorrelation({ agentId: 'a1', sessionId: 's1', templateName: 'tanstack-start-runner', workerDeploymentId: 'd1' });
		expect(c.projectId).toBe('a1');
		expect(c.buildId).toBe('s1');
		expect(c.templateName).toBe('tanstack-start-runner');
		expect(c.workerDeploymentId).toBe('d1');
	});
	it('fills not_available for missing inputs (never silently omits)', () => {
		const c = makeDeployCorrelation({});
		expect(c.agentId).toBe('not_available');
		expect(c.sessionId).toBe('not_available');
		expect(c.templateName).toBe('not_available');
		expect(c.workerDeploymentId).toBe('not_available');
	});
});

describe('immutable refinement', () => {
	it('withSandboxInstance / withDeploymentAttempt return new objects', () => {
		const base = makeDeployCorrelation({ agentId: 'a1', sessionId: 's1' });
		const withInst = withSandboxInstance(base, 'i-123');
		const withAtt = withDeploymentAttempt(withInst, 2);
		expect(base.sandboxInstanceId).toBeUndefined();
		expect(withInst.sandboxInstanceId).toBe('i-123');
		expect(withInst.deploymentAttempt).toBeUndefined();
		expect(withAtt.deploymentAttempt).toBe(2);
		expect(withAtt.sandboxInstanceId).toBe('i-123');
	});
});

describe('readWorkerDeploymentId', () => {
	it('reads CF_VERSION_METADATA.id, falls back to tag, then not_available', () => {
		expect(readWorkerDeploymentId({ CF_VERSION_METADATA: { id: 'v1', tag: 't1' } })).toBe('v1');
		expect(readWorkerDeploymentId({ CF_VERSION_METADATA: { tag: 't1' } })).toBe('t1');
		expect(readWorkerDeploymentId({})).toBe('not_available');
		expect(readWorkerDeploymentId(undefined)).toBe('not_available');
	});
});

describe('boundedRedactedTail', () => {
	it('keeps only the last maxLen chars', () => {
		const long = 'x'.repeat(1000);
		expect(boundedRedactedTail(long, 600)?.length).toBe(600);
	});
	it('redacts key=value secrets and JWTs', () => {
		expect(boundedRedactedTail('Authorization: Bearer abc123secret')).toContain('[REDACTED]');
		expect(boundedRedactedTail('api_key=supersecretvalue')).toContain('[REDACTED]');
		const jwt = 'token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4';
		expect(boundedRedactedTail(jwt)).toContain('[REDACTED');
	});
	it('returns undefined for undefined input', () => {
		expect(boundedRedactedTail(undefined)).toBeUndefined();
	});
});

describe('logDeployEvent', () => {
	it('emits all correlation fields explicitly (not_available when unknown)', () => {
		const { logger, calls } = makeFakeLogger();
		const c = withDeploymentAttempt(withSandboxInstance(makeDeployCorrelation({ agentId: 'a1', sessionId: 's1', templateName: 'tmpl', workerDeploymentId: 'd1' }), 'i-9'), 1);
		logDeployEvent(logger, c, 'dependency_install_completed', { phase: 'dependency_install', command: 'bun install', exitCode: 0, elapsedMs: 1234 });
		expect(calls).toHaveLength(1);
		const { level, message, payload } = calls[0];
		expect(level).toBe('info');
		expect(message).toBe('dependency_install_completed');
		expect(payload.deployEvent).toBe('dependency_install_completed');
		expect(payload.agentId).toBe('a1');
		expect(payload.projectId).toBe('a1');
		expect(payload.sessionId).toBe('s1');
		expect(payload.buildId).toBe('s1');
		expect(payload.sandboxInstanceId).toBe('i-9');
		expect(payload.deploymentAttempt).toBe(1);
		expect(payload.workerDeploymentId).toBe('d1');
		expect(payload.command).toBe('bun install');
		expect(payload.exitCode).toBe(0);
	});

	it('uses not_available for every correlation field when correlation is undefined', () => {
		const { logger, calls } = makeFakeLogger();
		logDeployEvent(logger, undefined, 'sandbox_provisioning_failed', { phase: 'sandbox_provisioning' }, 'error');
		const { level, payload } = calls[0];
		expect(level).toBe('error');
		for (const k of ['agentId', 'projectId', 'sessionId', 'buildId', 'templateName', 'sandboxInstanceId', 'deploymentAttempt', 'workerDeploymentId']) {
			expect(payload[k]).toBe('not_available');
		}
	});

	it('redacts stdout/stderr tails passed through', () => {
		const { logger, calls } = makeFakeLogger();
		logDeployEvent(logger, undefined, 'dependency_install_failed', { stderrTail: 'fatal: api_key=leakedsecret not allowed' }, 'error');
		expect(String(calls[0].payload.stderrTail)).toContain('[REDACTED]');
		expect(String(calls[0].payload.stderrTail)).not.toContain('leakedsecret');
	});
});
