import { describe, it, expect } from 'vitest';
import { patchImportedFile } from './lovableAdapter';

const f = (filePath: string, fileContents: string) => ({ filePath, fileContents });

describe('patchImportedFile', () => {
    it('injects the runtime error overlay before </head>', () => {
        const out = patchImportedFile(f('index.html', '<html><head><title>x</title></head><body></body></html>'));
        expect(out.fileContents).toContain('__daisan_err');
        expect(out.fileContents).toContain("addEventListener('error'");
        // The overlay must be inside <head>, before it closes.
        expect(out.fileContents.indexOf('__daisanErr')).toBeLessThan(out.fileContents.indexOf('</head>'));
    });

    it('does not inject the overlay twice (idempotent)', () => {
        const once = patchImportedFile(f('index.html', '<head></head>'));
        const twice = patchImportedFile(f('index.html', once.fileContents));
        const blocks = (twice.fileContents.match(/window\.__daisanErr\)return/g) || []).length;
        expect(blocks).toBe(1);
    });

    it('falls back to <body> when there is no </head>', () => {
        const out = patchImportedFile(f('index.html', '<body><div id="root"></div></body>'));
        expect(out.fileContents).toContain('__daisan_err');
    });

    it('binds the vite dev script to the sandbox host/port (package.json)', () => {
        const pkg = JSON.stringify({ scripts: { dev: 'vite' } });
        const out = patchImportedFile(f('package.json', pkg));
        expect(out.fileContents).toContain('--host 0.0.0.0');
        expect(out.fileContents).toContain('--port');
    });

    it('strips the lovable-tagger plugin from vite.config.ts', () => {
        const cfg =
            `import { componentTagger } from "lovable-tagger";\n` +
            `export default { plugins: [mode === 'development' && componentTagger()] }`;
        const out = patchImportedFile(f('vite.config.ts', cfg));
        expect(out.fileContents).not.toContain('lovable-tagger');
        expect(out.fileContents).not.toContain('componentTagger()');
    });

    it('leaves unrelated files untouched', () => {
        const out = patchImportedFile(f('src/App.tsx', 'export default 1;'));
        expect(out.fileContents).toBe('export default 1;');
    });
});
