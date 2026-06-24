import { describe, it, expect } from 'vitest';
import type { StructuredLogger } from '../../logger';
import {
	isTemplateIdentityValid,
	templateArtifactKeyFor,
	logLifecycleEvent,
} from './lifecycleLogger';

type Captured = { level: string; message: string; payload: Record<string, unknown> };

/** Minimal StructuredLogger stand-in that records calls (only info/warn/error are used). */
function makeFakeLogger(): { logger: StructuredLogger; calls: Captured[] } {
	const calls: Captured[] = [];
	const record = (level: string) => (message: string, payload?: Record<string, unknown>) =>
		calls.push({ level, message, payload: payload ?? {} });
	const logger = {
		info: record('info'),
		warn: record('warn'),
		error: record('error'),
	} as unknown as StructuredLogger;
	return { logger, calls };
}

describe('isTemplateIdentityValid', () => {
	it('is true for a non-empty stored name', () => {
		expect(isTemplateIdentityValid('tanstack-start-runner')).toBe(true);
		expect(isTemplateIdentityValid('custom')).toBe(true);
	});

	it('is false for blank/missing/whitespace stored name', () => {
		expect(isTemplateIdentityValid('')).toBe(false);
		expect(isTemplateIdentityValid(undefined)).toBe(false);
		expect(isTemplateIdentityValid('   ')).toBe(false);
	});

	it('is false when received and stored are inconsistent', () => {
		expect(isTemplateIdentityValid('c-code-react-runner', 'tanstack-start-runner')).toBe(false);
	});

	it('is true when received matches stored', () => {
		expect(isTemplateIdentityValid('tanstack-start-runner', 'tanstack-start-runner')).toBe(true);
	});

	it('ignores a blank received name (only stored must be present)', () => {
		expect(isTemplateIdentityValid('tanstack-start-runner', '')).toBe(true);
	});
});

describe('templateArtifactKeyFor', () => {
	it('derives the R2 zip key from a real template name', () => {
		expect(templateArtifactKeyFor('tanstack-start-runner')).toBe('tanstack-start-runner.zip');
	});

	it('returns undefined for pseudo/blank templates', () => {
		expect(templateArtifactKeyFor('custom')).toBeUndefined();
		expect(templateArtifactKeyFor('scratch')).toBeUndefined();
		expect(templateArtifactKeyFor('')).toBeUndefined();
		expect(templateArtifactKeyFor(undefined)).toBeUndefined();
	});
});

describe('logLifecycleEvent', () => {
	it('emits the event name, validity flag, derived id and artifact key', () => {
		const { logger, calls } = makeFakeLogger();
		logLifecycleEvent(logger, 'template_identity_persisted', {
			phase: 'initialize',
			identity: {
				receivedTemplateName: 'tanstack-start-runner',
				storedTemplateName: 'tanstack-start-runner',
			},
		});
		expect(calls).toHaveLength(1);
		const { level, message, payload } = calls[0];
		expect(level).toBe('info');
		expect(message).toBe('template_identity_persisted');
		expect(payload.lifecycleEvent).toBe('template_identity_persisted');
		expect(payload.templateIdentityValid).toBe(true);
		expect(payload.templateId).toBe('tanstack-start-runner');
		expect(payload.templateArtifactKey).toBe('tanstack-start-runner.zip');
		expect(payload.receivedTemplateName).toBe('tanstack-start-runner');
		expect(payload.storedTemplateName).toBe('tanstack-start-runner');
		expect(payload.phase).toBe('initialize');
	});

	it('flags a blank stored identity as invalid', () => {
		const { logger, calls } = makeFakeLogger();
		logLifecycleEvent(logger, 'ensure_template_details_failed', {
			phase: 'template_load',
			reason: 'blank_template_name',
			identity: { storedTemplateName: '' },
		}, 'error');
		expect(calls[0].level).toBe('error');
		expect(calls[0].payload.templateIdentityValid).toBe(false);
		expect(calls[0].payload.reason).toBe('blank_template_name');
		// No template id/artifact key when there is no usable name.
		expect(calls[0].payload.templateId).toBeUndefined();
		expect(calls[0].payload.templateArtifactKey).toBeUndefined();
	});

	it('does not emit identity fields when none are supplied', () => {
		const { logger, calls } = makeFakeLogger();
		logLifecycleEvent(logger, 'agent_initialize_started', { phase: 'initialize' });
		expect(calls[0].payload.lifecycleEvent).toBe('agent_initialize_started');
		expect(calls[0].payload.templateIdentityValid).toBe(false);
		expect('receivedTemplateName' in calls[0].payload).toBe(false);
		expect('storedTemplateName' in calls[0].payload).toBe(false);
	});
});
