import { timingSafeEqual } from 'crypto';
import { google } from 'googleapis';

export const runtime = 'nodejs';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

type TokenCheckResponse = {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
};

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const [k, ...rest] = chunk.trim().split('=');
    if (k === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function safeCompare(left: string, right: string | null) {
  if (!right) return false;

  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function clearStateCookie() {
  const parts = ['oauth_state=', 'Path=/', 'HttpOnly', 'Max-Age=0', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response('Missing code', {
        status: 400,
        headers: { 'cache-control': 'no-store' },
      });
    }

    const stateFromCookie = readCookie(req.headers.get('cookie'), 'oauth_state');
    if (!state || !stateFromCookie || !safeCompare(stateFromCookie, state)) {
      return new Response('Invalid state', {
        status: 400,
        headers: { 'cache-control': 'no-store' },
      });
    }

    const oauth2 = new google.auth.OAuth2(
      mustEnv('GOOGLE_CLIENT_ID'),
      mustEnv('GOOGLE_CLIENT_SECRET'),
      mustEnv('GOOGLE_REDIRECT_URI')
    );

    const { tokens } = await oauth2.getToken(code);

    const resp: TokenCheckResponse = {
      hasAccessToken: Boolean(tokens.access_token),
      hasRefreshToken: Boolean(tokens.refresh_token),
    };

    return new Response(JSON.stringify(resp, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': clearStateCookie(),
      },
    });
  } catch {
    return new Response('OAuth callback failed', {
      status: 500,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
