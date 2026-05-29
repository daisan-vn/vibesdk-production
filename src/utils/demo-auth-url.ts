import {
	ENABLE_DEMO_WITHOUT_AUTH,
	DEMO_ACCESS_TOKEN,
} from '../../shared/constants/demo-auth';

/** Append demo token for WebSocket connections (cookies are not sent with token auth). */
export function withDemoAuthQueryParam(url: string): string {
	if (!ENABLE_DEMO_WITHOUT_AUTH || !url) {
		return url;
	}

	try {
		const parsed = new URL(url, window.location.origin);
		if (!parsed.searchParams.has('token')) {
			parsed.searchParams.set('token', DEMO_ACCESS_TOKEN);
		}
		return parsed.toString();
	} catch {
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}token=${encodeURIComponent(DEMO_ACCESS_TOKEN)}`;
	}
}
