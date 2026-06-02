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

/** Strip Lovable's dev-only `componentTagger`/`lovable-tagger` plugin (absent in the sandbox). */
function patchViteConfig(file: TemplateFile): TemplateFile {
    if (!file.fileContents.includes('lovable-tagger') && !file.fileContents.includes('componentTagger')) {
        return file;
    }
    const content = file.fileContents
        .replace(/import\s*\{?\s*componentTagger\s*\}?\s*from\s*["']lovable-tagger["'];?/g, '')
        .replace(/mode\s*===\s*["']development["']\s*&&\s*componentTagger\(\)/g, 'false');
    return { ...file, fileContents: content };
}

/**
 * A tiny runtime error overlay injected into the imported app. If the app throws at
 * runtime (e.g. missing Supabase env), React unmounts and the preview would be a blank
 * white iframe; this catches window errors + unhandled rejections and renders the real
 * error on screen instead, so the user never faces a silent blank preview. XSS-safe
 * (textContent), idempotent, and self-contained so it survives Vite's html processing.
 */
const ERROR_OVERLAY_SNIPPET =
    `<script>(function(){if(window.__daisanErr)return;window.__daisanErr=1;` +
    `function show(title,detail){if(document.getElementById('__daisan_err'))return;` +
    `var w=document.createElement('div');w.id='__daisan_err';w.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#1b1b1b;color:#eee;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;padding:32px;overflow:auto';` +
    `var h=document.createElement('div');h.style.cssText='color:#ff5a1f;font-weight:700;font-size:15px;margin-bottom:6px';h.textContent='App runtime error';` +
    `var s=document.createElement('div');s.style.cssText='color:#999;margin-bottom:16px';s.textContent='The preview crashed instead of showing a blank screen (overlay by Daisan).';` +
    `var t=document.createElement('div');t.style.cssText='font-weight:600;margin-bottom:8px;color:#fff';t.textContent=title;` +
    `var p=document.createElement('pre');p.style.cssText='white-space:pre-wrap;word-break:break-word;background:#000;border:1px solid #333;border-radius:8px;padding:14px;color:#ff8a65;margin:0';p.textContent=detail;` +
    `[h,s,t,p].forEach(function(n){w.appendChild(n)});(document.body||document.documentElement).appendChild(w)}` +
    `window.addEventListener('error',function(e){show(e.message||'Error',(e.error&&e.error.stack)||e.message||String(e))});` +
    `window.addEventListener('unhandledrejection',function(e){var r=e.reason;show('Unhandled promise rejection',(r&&(r.stack||r.message))||String(r))})})();</script>`;

/** Inject the runtime error overlay so a crashing imported app never shows a blank iframe. */
function patchIndexHtml(file: TemplateFile): TemplateFile {
    if (file.fileContents.includes('__daisan_err')) {
        return file; // already injected
    }
    let content: string;
    if (file.fileContents.includes('</head>')) {
        content = file.fileContents.replace('</head>', `${ERROR_OVERLAY_SNIPPET}\n</head>`);
    } else if (file.fileContents.includes('<body>')) {
        content = file.fileContents.replace('<body>', `<body>\n${ERROR_OVERLAY_SNIPPET}`);
    } else {
        content = `${ERROR_OVERLAY_SNIPPET}\n${file.fileContents}`;
    }
    return { ...file, fileContents: content };
}

/**
 * Neutralize import-time incompatibilities so a clean sandbox install/run succeeds:
 * - Force vite dev/preview scripts to bind the sandbox proxy host/port (package.json).
 * - Strip Lovable's dev-only `lovable-tagger` plugin (vite config).
 * - Inject a runtime error overlay so a crash shows the error instead of a blank iframe.
 */
export function patchImportedFile(file: TemplateFile): TemplateFile {
    if (file.filePath === 'package.json') {
        return patchPackageJson(file);
    }
    if (file.filePath === 'index.html') {
        return patchIndexHtml(file);
    }
    if (file.filePath === 'vite.config.ts' || file.filePath === 'vite.config.js') {
        return patchViteConfig(file);
    }
    return file;
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
