import { describe, it, expect } from 'vitest';
import { injectVisualEditBridge, VISUAL_EDIT_BRIDGE_SNIPPET } from './visualEditBridge';

describe('injectVisualEditBridge', () => {
	it('injects the bridge before </head>', () => {
		const out = injectVisualEditBridge('<html><head><title>x</title></head><body></body></html>');
		expect(out).toContain('__daisanVE');
		expect(out.indexOf('__daisanVE')).toBeLessThan(out.indexOf('</head>'));
	});

	it('is idempotent', () => {
		const once = injectVisualEditBridge('<head></head>');
		const twice = injectVisualEditBridge(once);
		expect(once).toBe(twice);
		expect(once.match(/__daisan_ve_box/g)?.length).toBe(1);
	});

	it('falls back to <body> when there is no </head>', () => {
		const out = injectVisualEditBridge('<body><div id="root"></div></body>');
		expect(out).toContain('__daisanVE');
		expect(out.indexOf('__daisanVE')).toBeGreaterThan(out.indexOf('<body>'));
	});

	it('prepends when there is no head or body', () => {
		const out = injectVisualEditBridge('<div>x</div>');
		expect(out.startsWith(VISUAL_EDIT_BRIDGE_SNIPPET)).toBe(true);
	});
});
