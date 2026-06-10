import { isOriginAllowed } from '../../config/security';
import { createLogger } from '../../logger';

const logger = createLogger('WebSocketSecurity');

export function validateWebSocketOrigin(request: Request, env: Env): boolean {
    const origin = request.headers.get('Origin');
    
    if (!origin) {
        // Server-side SDK clients do not send `Origin`.
        // ownership and authorization is anyways checked in the middlewares already
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
            return true;
        }

        logger.warn('WebSocket connection attempt without Origin header');
        return false;
    }
    
    // Same-origin connections are always legitimate: the client page is served by
    // this very worker, so its Origin host equals the request host. This must work
    // regardless of how the app is served (workers.dev, custom domain, localhost).
    // CUSTOM_DOMAIN is empty on workers.dev deploys, which leaves the configured
    // allowlist empty — without this check every same-origin handshake 403s.
    if (isSameOrigin(request, origin)) {
        return true;
    }

    if (!isOriginAllowed(env, origin)) {
        logger.warn('WebSocket connection rejected from unauthorized origin', { origin });
        return false;
    }

    return true;
}

function isSameOrigin(request: Request, origin: string): boolean {
    try {
        const requestHost = request.headers.get('Host') ?? new URL(request.url).host;
        return new URL(origin).host === requestHost;
    } catch {
        return false;
    }
}

export function getWebSocketSecurityHeaders(): Record<string, string> {
    return {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
    };
}
