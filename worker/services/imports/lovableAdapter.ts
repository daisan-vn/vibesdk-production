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
 * Guard Lovable's `lovable-tagger` Vite plugin so a clean sandbox build does not
 * fail when the plugin is missing or incompatible. The plugin is dev-only tooling.
 */
export function patchImportedFile(file: TemplateFile): TemplateFile {
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
