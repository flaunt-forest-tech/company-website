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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

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
    headers: { 'content-type': 'application/json' },
  });
}
