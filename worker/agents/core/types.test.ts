import { describe, expect, it } from 'vitest';
import { resolveChatMode } from './types';

describe('resolveChatMode (Plan/Build mode)', () => {
	it("defaults to 'plan' when no mode is provided", () => {
		expect(resolveChatMode(undefined)).toBe('plan');
		expect(resolveChatMode(null)).toBe('plan');
		expect(resolveChatMode('')).toBe('plan');
	});

	it("returns 'build' only when explicitly 'build'", () => {
		expect(resolveChatMode('build')).toBe('build');
	});

	it("falls back to 'plan' for any unknown/invalid value", () => {
		expect(resolveChatMode('plan')).toBe('plan');
		expect(resolveChatMode('Build')).toBe('plan'); // case-sensitive on purpose
		expect(resolveChatMode('hack')).toBe('plan');
		expect(resolveChatMode(42)).toBe('plan');
		expect(resolveChatMode({})).toBe('plan');
	});
});
