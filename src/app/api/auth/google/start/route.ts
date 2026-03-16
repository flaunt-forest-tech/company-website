import { randomBytes } from 'crypto';
import { google } from 'googleapis';

export const runtime = 'nodejs';

const SCOPES: ReadonlyArray<string> = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function base64Url(input: Buffer) {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function buildStateCookie(state: string) {
  const parts = ['oauth_state=' + encodeURIComponent(state), 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  parts.push('Max-Age=600');
  return parts.join('; ');
}

export async function GET() {
  try {
    const oauth2 = new google.auth.OAuth2(
      mustEnv('GOOGLE_CLIENT_ID'),
      mustEnv('GOOGLE_CLIENT_SECRET'),
      mustEnv('GOOGLE_REDIRECT_URI')
    );

    const state = base64Url(randomBytes(24));

    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [...SCOPES],
      state,
    });

    return new Response(null, {
      status: 302,
      headers: {
        location: url,
        'set-cookie': buildStateCookie(state),
        'cache-control': 'no-store',
      },
    });
  } catch {
    return new Response('OAuth start failed', {
      status: 500,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
