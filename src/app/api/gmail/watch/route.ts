import { google } from 'googleapis';

export const runtime = 'nodejs';

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

type OkResp = {
  ok: true;
  topicName: string;
  historyId: string | null;
  expiration: string | null;
};

type ErrResp = {
  ok: false;
  message: string;
  details?: unknown;
};

export async function POST() {
  try {
    const oauth2 = new google.auth.OAuth2(
      mustEnv('GOOGLE_CLIENT_ID'),
      mustEnv('GOOGLE_CLIENT_SECRET'),
      mustEnv('GOOGLE_REDIRECT_URI')
    );

    oauth2.setCredentials({
      refresh_token: mustEnv('GOOGLE_REFRESH_TOKEN'),
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    const topicName = mustEnv('GCP_PUBSUB_TOPIC');

    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });

    const out: OkResp = {
      ok: true,
      topicName,
      historyId: res.data.historyId ?? null,
      expiration: res.data.expiration ?? null,
    };

    return new Response(JSON.stringify(out, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: unknown) {
    const err = e as { message?: string; response?: unknown; stack?: string };

    const out: ErrResp = {
      ok: false,
      message: err?.message ?? 'Unknown error',
      details: err?.response ?? err?.stack ?? null,
    };

    return new Response(JSON.stringify(out, null, 2), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
