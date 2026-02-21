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

export async function GET() {
  const oauth2 = new google.auth.OAuth2(
    mustEnv('GOOGLE_CLIENT_ID'),
    mustEnv('GOOGLE_CLIENT_SECRET'),
    mustEnv('GOOGLE_REDIRECT_URI')
  );

  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [...SCOPES],
  });

  return Response.redirect(url);
}
