import type { TemplateFile } from '../sandbox/sandboxTypes';

/**
 * Helpers for importing an external (e.g. Lovable) project into a build session.
 * They normalize a raw file list (from a zip/tarball) and neutralize Lovable-specific
 * pieces that would break a clean sandbox install/build.
 */

const NOISE_DIR = /(^|\/)(node_modules|\.git|dist|build|\.next|out|coverage|test-results|playwright-report)\//;
const NOISE_FILES = new Set([
    'bun.lockb',
    'bun.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
]);

/**
 * Drop build/dependency noise and strip the single wrapper directory that
 * GitHub/Lovable archives put around the project (e.g. "my-app-abc123/...").
 */
export function normalizeImportedFiles(files: TemplateFile[]): TemplateFile[] {
    const kept = files.filter(
        (f) => !NOISE_DIR.test(f.filePath) && !NOISE_FILES.has(f.filePath.split('/').pop() ?? ''),
    );
    if (kept.length === 0) {
        return kept;
    }

    // Detect a common top-level wrapper directory shared by every file.
    const firstSegment = kept[0].filePath.split('/')[0];
    const hasWrapperDir =
        firstSegment.length > 0 &&
        kept.every((f) => f.filePath.startsWith(`${firstSegment}/`));

    if (!hasWrapperDir) {
        return kept;
    }
    const prefixLen = firstSegment.length + 1;
    return kept.map((f) => ({ ...f, filePath: f.filePath.slice(prefixLen) }));
}

/**
 * The sandbox runs the dev/preview server behind a proxy that expects it to bind
 * 0.0.0.0 on the port injected via $PORT (matching the VibeSDK template scripts).
 * A bare `vite` binds localhost:5173, so the preview proxy finds nothing listening.
 * This appends the host/port flags to any vite-based script that lacks them.
 */
const SANDBOX_VITE_FLAGS = '--host 0.0.0.0 --port ${PORT:-8001}';

function patchViteScript(script: string): string {
    if (!/\bvite\b/.test(script) || script.includes('--port')) {
        return script;
    }
    return `${script.trim()} ${SANDBOX_VITE_FLAGS}`;
}

function patchPackageJson(file: TemplateFile): TemplateFile {
    let parsed: { scripts?: Record<string, string> };
    try {
        parsed = JSON.parse(file.fileContents) as { scripts?: Record<string, string> };
    } catch {
        return file;
    }
    if (!parsed.scripts) {
        return file;
    }
    let changed = false;
    for (const key of ['dev', 'start', 'preview']) {
        const script = parsed.scripts[key];
        if (typeof script === 'string') {
            const patched = patchViteScript(script);
            if (patched !== script) {
                parsed.scripts[key] = patched;
                changed = true;
            }
        }
    }
    if (!changed) {
        return file;
    }
    return { ...file, fileContents: `${JSON.stringify(parsed, null, 2)}\n` };
}

/**
 * Neutralize import-time incompatibilities so a clean sandbox install/run succeeds:
 * - Guard Lovable's dev-only `lovable-tagger` Vite plugin (missing in the sandbox).
 * - Force vite dev/preview scripts to bind the sandbox proxy host/port.
 */
export function patchImportedFile(file: TemplateFile): TemplateFile {
    if (file.filePath === 'package.json') {
        return patchPackageJson(file);
    }
    if (file.filePath !== 'vite.config.ts' && file.filePath !== 'vite.config.js') {
        return file;
    }
    if (!file.fileContents.includes('lovable-tagger') && !file.fileContents.includes('componentTagger')) {
        return file;
    }
    const content = file.fileContents
        .replace(/import\s*\{?\s*componentTagger\s*\}?\s*from\s*["']lovable-tagger["'];?/g, '')
        .replace(/mode\s*===\s*["']development["']\s*&&\s*componentTagger\(\)/g, 'false');
    return { ...file, fileContents: content };
}

/** Read the project name from package.json, if present. */
export function readImportedName(files: TemplateFile[]): string | null {
    const pkg = files.find((f) => f.filePath === 'package.json');
    if (!pkg) {
        return null;
    }
    try {
        const parsed = JSON.parse(pkg.fileContents) as { name?: string };
        return parsed.name ?? null;
    } catch {
        return null;
    }
}
