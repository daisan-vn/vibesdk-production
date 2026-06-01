import { useEffect, useState, useRef, forwardRef, useCallback, type ReactNode } from 'react';
import { useParams } from 'react-router';
import { RefreshCw, AlertCircle, Globe, ChevronDown, ExternalLink } from 'lucide-react';
import { WebSocket } from 'partysocket';
import { apiClient } from '@/lib/api-client';

interface PreviewIframeProps {
    src: string;
    className?: string;
    title?: string;
    shouldRefreshPreview?: boolean;
    manualRefreshTrigger?: number;
    webSocket?: WebSocket | null;
}

// ============================================================================
// Types & Constants
// ============================================================================

interface LoadState {
    status: 'idle' | 'loading' | 'postload' | 'loaded' | 'error';
    attempt: number;
    loadedSrc: string | null;
    errorMessage: string | null;
    previewType?: 'sandbox' | 'dispatcher';
}

const MAX_RETRIES = 10;
const REDEPLOY_AFTER_ATTEMPT = 5;
const POST_LOAD_WAIT_SANDBOX = 0;
const POST_LOAD_WAIT_DISPATCHER = 0;

const getRetryDelay = (attempt: number): number => {
	// 1s, 2s, 4s, 8s (capped)
	return Math.min(1000 * Math.pow(2, attempt), 8000);
};

// ============================================================================
// Main Component
// ============================================================================

export const PreviewIframe = forwardRef<HTMLIFrameElement, PreviewIframeProps>(
	({ src, className = '', title = 'Preview', shouldRefreshPreview = false, manualRefreshTrigger, webSocket }, ref) => {
		
		const [loadState, setLoadState] = useState<LoadState>({
			status: 'idle',
			attempt: 0,
			loadedSrc: null,
			errorMessage: null,
		});

		const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
		const hasRequestedRedeployRef = useRef(false);
        const postLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const lastProbeHttpStatusRef = useRef<number | null>(null);

		// ====================================================================
		// Route navigator (address bar + route dropdown, like Lovable)
		// ====================================================================
		const { chatId: agentId } = useParams();
		const [routes, setRoutes] = useState<string[]>(['/']);
		const [currentPath, setCurrentPath] = useState('/');
		const [pathInput, setPathInput] = useState('/');
		const [showRoutes, setShowRoutes] = useState(false);

		// Fetch the project's routes once we have an agent id.
		useEffect(() => {
			if (!agentId) return;
			let cancelled = false;
			apiClient.getProjectRoutes(agentId).then((list) => {
				if (!cancelled && list.length > 0) setRoutes(list);
			});
			return () => {
				cancelled = true;
			};
		}, [agentId]);

		// Build the effective iframe URL: keep the preview origin (+ token) and swap the path.
		const buildUrl = useCallback((base: string | null, path: string): string => {
			if (!base) return '';
			try {
				const u = new URL(base);
				u.pathname = path && path.startsWith('/') ? path : '/';
				return u.toString();
			} catch {
				return base;
			}
		}, []);

		const navigateTo = useCallback((path: string) => {
			const normalized = path.trim() ? (path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`) : '/';
			setCurrentPath(normalized);
			setPathInput(normalized);
			setShowRoutes(false);
		}, []);
		// ====================================================================
		// Core Loading Logic
		// ====================================================================

		/**
		 * Test if URL is accessible using a simple HEAD request
		 * Returns preview type if accessible, null otherwise
		 */
		const testAvailability = useCallback(async (url: string): Promise<'sandbox' | 'dispatcher' | null> => {
			try {
				const response = await fetch(url, {
					method: 'HEAD',
					mode: 'cors', // Using CORS to read security-validated headers
					cache: 'no-cache',
					signal: AbortSignal.timeout(8000),
				});
                console.log('Preview availability test response:', response, response.headers.forEach((value, key) => console.log("Header: ",key, value)));
                lastProbeHttpStatusRef.current = response.status;
				
				if (!response.ok) {
					console.log('Preview not ready (status:', response.status, ')');
					return null;
				}
				
				// Read the custom header to determine preview type
				// Header will only be present if origin validation passed on server
				const previewType = response.headers.get('X-Preview-Type');
				
                if (previewType === 'sandbox-error') {
                    console.log('Preview not ready (sandbox error)');
                    return null;
                } else if (previewType === 'sandbox' || previewType === 'dispatcher') {
					console.log('Preview available, type:', previewType);
					return previewType;
				}
				
				// Fallback: If no header present (shouldn't happen with valid origin)
				// but the response is OK, assume sandbox for backward compatibility
				console.log('Preview available (type unknown, assuming sandbox)');
				return 'sandbox';
			} catch (error) {
				console.log('Preview not available yet:', error);
                lastProbeHttpStatusRef.current = null;
				return null;
			}
		}, []);

		/**
		 * Request automatic redeployment via WebSocket
		 */
		const requestRedeploy = useCallback(() => {
			if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
				console.warn('Cannot request redeploy: WebSocket not connected');
				return;
			}

			if (hasRequestedRedeployRef.current) {
				console.log('Redeploy already requested, skipping duplicate request');
				return;
			}

			console.log('Requesting automatic preview redeployment');
			
			try {
				webSocket.send(JSON.stringify({
					type: 'preview',
				}));
				hasRequestedRedeployRef.current = true;
			} catch (error) {
				console.error('Failed to send redeploy request:', error);
			}
		}, [webSocket]);

		/**
		 * Request screenshot capture via WebSocket
		 */
		const requestScreenshot = useCallback((url: string) => {
			if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
				console.warn('Cannot request screenshot: WebSocket not connected');
				return;
			}

			console.log('Requesting screenshot capture');
			
			try {
				webSocket.send(JSON.stringify({
					type: 'capture_screenshot',
					data: {
						url,
						viewport: { width: 1280, height: 720 },
					},
				}));
			} catch (error) {
				console.error('Failed to send screenshot request:', error);
			}
		}, [webSocket]);

		/**
		 * Attempt to load the preview with retry logic
		 */
		const loadWithRetry = useCallback(async (url: string, attempt: number) => {
			// Clear any pending retry
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}

            if (postLoadTimeoutRef.current) {
                clearTimeout(postLoadTimeoutRef.current);
                postLoadTimeoutRef.current = null;
            }

			// Check if we've exceeded max retries
			if (attempt >= MAX_RETRIES) {
				setLoadState({
					status: 'error',
					attempt,
					loadedSrc: null,
					errorMessage: 'Preview failed to load after multiple attempts',
				});
				return;
			}

			// Update state to show loading
			setLoadState({
				status: 'loading',
				attempt: attempt + 1,
				loadedSrc: null,
				errorMessage: null,
			});

			// Test availability
			const previewType = await testAvailability(url);
            const isTunnelPreview = /trycloudflare\.com/i.test(url);

			if (previewType) {
				// Success: put component into postload state, keep loading UI visible
				console.log(`Preview available (${previewType}) at attempt ${attempt + 1}`);
				setLoadState({
					status: 'postload',
					attempt: attempt + 1,
					loadedSrc: url,
					errorMessage: null,
					previewType,
				});

				// Wait for page to render before revealing iframe and capturing screenshot
				const waitTime = previewType === 'dispatcher' ? POST_LOAD_WAIT_DISPATCHER : POST_LOAD_WAIT_SANDBOX;
				console.log(`Waiting ${waitTime}ms before showing preview and capturing screenshot (${previewType} app)`);
				postLoadTimeoutRef.current = setTimeout(() => {
					setLoadState(prev => ({
						...prev,
						status: 'loaded',
					}));
					requestScreenshot(url);
				}, waitTime);
			} else {
				// Fallback: after a few failed availability checks (often CORS/HEAD false negatives),
				// try loading the iframe directly instead of keeping the user blocked.
				// Tunnel previews are prone to transient 502 while origin bootstraps;
				// keep retrying instead of surfacing a premature direct load.
				if (!isTunnelPreview && attempt >= 2 && lastProbeHttpStatusRef.current === null) {
					console.log('Preview probe unavailable - switching to direct iframe load fallback');
					setLoadState({
						status: 'postload',
						attempt: attempt + 1,
						loadedSrc: url,
						errorMessage: null,
						previewType: 'sandbox',
					});
					postLoadTimeoutRef.current = setTimeout(() => {
						setLoadState(prev => ({
							...prev,
							status: 'loaded',
						}));
						requestScreenshot(url);
					}, POST_LOAD_WAIT_SANDBOX);
					return;
				}

				// Not available yet - retry with backoff
				const delay = getRetryDelay(attempt);
				const nextAttempt = attempt + 1;
				
				console.log(`Preview not ready. Retrying in ${Math.ceil(delay / 1000)}s (attempt ${nextAttempt}/${MAX_RETRIES})`);

				// Auto-redeploy after 3 failed attempts
				if (nextAttempt === REDEPLOY_AFTER_ATTEMPT) {
					requestRedeploy();
				}

				// Schedule next retry
				retryTimeoutRef.current = setTimeout(() => {
					loadWithRetry(url, nextAttempt);
				}, delay);
			}
		}, [testAvailability, requestScreenshot, requestRedeploy]);

		/**
		 * Force a fresh reload from scratch
		 */
		const forceReload = useCallback(() => {
			console.log('Force reloading preview');
			hasRequestedRedeployRef.current = false;
			
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}

            if (postLoadTimeoutRef.current) {
                clearTimeout(postLoadTimeoutRef.current);
                postLoadTimeoutRef.current = null;
            }

			setLoadState({
				status: 'idle',
				attempt: 0,
				loadedSrc: null,
				errorMessage: null,
			});

			// Start loading
			loadWithRetry(src, 0);
		}, [src, loadWithRetry]);

		// ====================================================================
		// Effects
		// ====================================================================

		/**
		 * Effect: Load when src changes
		 */
		useEffect(() => {
			if (!src) return;

			console.log('Preview src changed, starting load:', src);
			hasRequestedRedeployRef.current = false;
			// A new preview base may not have the previously-navigated route — reset to root.
			setCurrentPath('/');
			setPathInput('/');

			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
				retryTimeoutRef.current = null;
			}

            if (postLoadTimeoutRef.current) {
                clearTimeout(postLoadTimeoutRef.current);
                postLoadTimeoutRef.current = null;
            }

			setLoadState({
				status: 'idle',
				attempt: 0,
				loadedSrc: null,
				errorMessage: null,
			});

			loadWithRetry(src, 0);

			return () => {
				if (retryTimeoutRef.current) {
					clearTimeout(retryTimeoutRef.current);
					retryTimeoutRef.current = null;
				}
				if (postLoadTimeoutRef.current) {
					clearTimeout(postLoadTimeoutRef.current);
					postLoadTimeoutRef.current = null;
				}
			};
		}, [src, loadWithRetry]);

		/**
		 * Effect: Auto-refresh after deployment
		 */
		useEffect(() => {
			if (shouldRefreshPreview && loadState.status === 'loaded' && loadState.loadedSrc) {
				console.log('Auto-refreshing preview after deployment');
				forceReload();
			}
		}, [shouldRefreshPreview, loadState.status, loadState.loadedSrc, forceReload]);

		/**
		 * Effect: Manual refresh trigger
		 */
		useEffect(() => {
			if (manualRefreshTrigger && manualRefreshTrigger > 0) {
				console.log('Manual refresh triggered');
				forceReload();
			}
		}, [manualRefreshTrigger, forceReload]);

		/**
		 * Effect: Cleanup on unmount
		 */
		useEffect(() => {
			return () => {
				if (retryTimeoutRef.current) {
					clearTimeout(retryTimeoutRef.current);
				}
				if (postLoadTimeoutRef.current) {
					clearTimeout(postLoadTimeoutRef.current);
				}
			};
		}, []);

		// ====================================================================
		// Render
		// ====================================================================

		const effectiveUrl = buildUrl(loadState.loadedSrc, currentPath);

		// Address bar + route dropdown (shown once a preview origin is available).
		const addressBar = loadState.loadedSrc ? (
			<div className="relative flex items-center gap-1 px-2 py-1.5 border-b border-text/10 bg-bg-3 shrink-0">
				<Globe className="size-3.5 text-text-primary/40 shrink-0" />
				<form
					className="flex-1 flex items-center min-w-0"
					onSubmit={(e) => {
						e.preventDefault();
						navigateTo(pathInput);
					}}
				>
					<input
						value={pathInput}
						onChange={(e) => setPathInput(e.target.value)}
						onFocus={() => setShowRoutes(true)}
						placeholder="/"
						spellCheck={false}
						className="w-full bg-transparent text-xs font-mono text-text-primary/80 outline-none px-1"
					/>
				</form>
				<button
					type="button"
					onClick={() => setShowRoutes((s) => !s)}
					title="Danh sách route"
					className="p-1 rounded hover:bg-accent text-text-primary/50 hover:text-text-primary shrink-0"
				>
					<ChevronDown className={`size-3.5 transition-transform ${showRoutes ? 'rotate-180' : ''}`} />
				</button>
				<a
					href={effectiveUrl}
					target="_blank"
					rel="noreferrer"
					title="Mở ở tab mới"
					className="p-1 rounded hover:bg-accent text-text-primary/50 hover:text-text-primary shrink-0"
				>
					<ExternalLink className="size-3.5" />
				</a>
				{showRoutes && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setShowRoutes(false)} />
						<div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-y-auto rounded-md border border-text/10 bg-bg-2 shadow-lg py-1">
							{routes.map((r) => (
								<button
									key={r}
									type="button"
									onClick={() => navigateTo(r)}
									className={`block w-full text-left px-3 py-1.5 text-xs font-mono truncate ${
										r === currentPath
											? 'text-brand bg-accent/40'
											: 'text-text-primary/70 hover:bg-accent hover:text-text-primary'
									}`}
								>
									{r}
								</button>
							))}
						</div>
					</>
				)}
			</div>
		) : null;

		let body: ReactNode;

		if (loadState.status === 'loaded' && loadState.loadedSrc) {
			// Successfully loaded — show iframe at the navigated path.
			body = (
				<iframe
					sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-orientation-lock	allow-popups allow-presentation"
					ref={ref}
					src={effectiveUrl}
					className="absolute inset-0 h-full w-full"
					title={title}
					style={{ border: 'none' }}
					onError={() => {
						console.error('Iframe failed to load');
						setLoadState(prev => ({ ...prev, status: 'error', errorMessage: 'Preview failed to render' }));
					}}
				/>
			);
		} else if (loadState.status === 'loading' || loadState.status === 'idle' || loadState.status === 'postload') {
			const delay = getRetryDelay(loadState.attempt - 1);
			const delaySeconds = Math.ceil(delay / 1000);
			body = (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-3">
					{loadState.status === 'postload' && loadState.loadedSrc && (
						<iframe
							sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-orientation-lock	allow-popups allow-presentation"
							ref={ref}
							src={effectiveUrl}
							className="absolute inset-0 opacity-0 pointer-events-none"
							title={title}
							aria-hidden="true"
							onError={() => {
								console.error('Iframe failed to load');
								setLoadState(prev => ({ ...prev, status: 'error', errorMessage: 'Preview failed to render' }));
							}}
						/>
					)}
					<div className="text-center p-8 max-w-md">
						<RefreshCw className="size-8 text-accent animate-spin mx-auto mb-4" />
						<h3 className="text-lg font-medium text-text-primary mb-2">Loading Preview</h3>
						<p className="text-text-primary/70 text-sm mb-4">
							{loadState.attempt === 0
								? 'Checking if your deployed preview is ready...'
								: `Preview not ready yet. Retrying in ${delaySeconds}s... (attempt ${loadState.attempt}/${MAX_RETRIES})`}
						</p>
						{loadState.attempt >= REDEPLOY_AFTER_ATTEMPT && (
							<p className="text-xs text-accent/70">Auto-redeployment triggered to refresh the preview</p>
						)}
						<div className="text-xs text-text-primary/50 mt-2">
							Preview URLs may take a moment to become available after deployment
						</div>
					</div>
				</div>
			);
		} else {
			// Error state — after max retries.
			body = (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-3">
					<div className="text-center p-8 max-w-md">
						<AlertCircle className="size-8 text-orange-500 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-text-primary mb-2">Preview Not Available</h3>
						<p className="text-text-primary/70 text-sm mb-6">
							{loadState.errorMessage || 'The preview failed to load after multiple attempts.'}
						</p>
						<div className="space-y-3">
							<button
								onClick={forceReload}
								className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors text-sm mx-auto font-medium w-full"
							>
								<RefreshCw className="size-4" />
								Try Again
							</button>
							<p className="text-xs text-text-primary/60">
								If the issue persists, please describe the problem in chat so I can help diagnose and fix it.
							</p>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className={`${className} flex flex-col overflow-hidden border border-text/10 rounded-lg`}>
				{addressBar}
				<div className="relative flex-1 min-h-0">{body}</div>
			</div>
		);
	}
);

PreviewIframe.displayName = 'PreviewIframe';
