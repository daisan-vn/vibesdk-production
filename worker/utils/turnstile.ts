/**
 * Cloudflare Turnstile server-side verification.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Verification is only enforced by callers when env.TURNSTILE_SECRET_KEY is set,
 * so the app keeps working unchanged until a widget is configured.
 */
import { createLogger } from '../logger';

const logger = createLogger('Turnstile');
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteVerifyResponse {
	success: boolean;
	'error-codes'?: string[];
	hostname?: string;
	action?: string;
}

/**
 * Validate a Turnstile token against Cloudflare's siteverify endpoint.
 * Returns true only when the token is valid. Never throws — network/parse
 * failures resolve to false so a broken captcha never silently lets bots in.
 */
export async function verifyTurnstileToken(
	token: string | undefined | null,
	secret: string,
	remoteIp?: string,
): Promise<boolean> {
	if (!token || token.trim() === '') {
		return false;
	}
	try {
		const form = new FormData();
		form.append('secret', secret);
		form.append('response', token);
		if (remoteIp) {
			form.append('remoteip', remoteIp);
		}
		const resp = await fetch(SITEVERIFY_URL, { method: 'POST', body: form });
		const data = (await resp.json()) as SiteVerifyResponse;
		if (!data.success) {
			logger.warn('Turnstile verification failed', {
				errors: data['error-codes'],
			});
		}
		return data.success === true;
	} catch (error) {
		logger.error('Turnstile verification error', error);
		return false;
	}
}
