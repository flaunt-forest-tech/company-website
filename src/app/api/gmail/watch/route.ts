import { timingSafeEqual } from 'crypto';
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
};

function safeCompare(secret: string, incoming: string | null) {
  if (!incoming) return false;

  const a = Buffer.from(secret, 'utf8');
  const b = Buffer.from(incoming, 'utf8');

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const secret = process.env.INTERNAL_API_SECRET?.trim() || '';
    const requireSecret = process.env.NODE_ENV === 'production';

    if (requireSecret && !secret) {
      return new Response('server misconfigured', { status: 500 });
    }

    if (secret && !safeCompare(secret, req.headers.get('x-internal-api-secret'))) {
      return new Response('unauthorized', { status: 401 });
    }

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
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const isProd = process.env.NODE_ENV === 'production';

    const out: ErrResp = {
      ok: false,
      message: isProd ? 'Internal server error' : (err?.message ?? 'Unknown error'),
    };

    return new Response(JSON.stringify(out, null, 2), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  }
}
