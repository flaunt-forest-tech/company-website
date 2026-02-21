import fs from 'fs/promises';
import path from 'path';
import { google, gmail_v1 } from 'googleapis';
import { createClient } from 'redis';
import { PubSubMessage, GmailPushPayload } from './types';

export const runtime = 'nodejs';

function decodeBase64Json<T>(b64: string): T | null {
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'gmail-history.json');
const PROCESSED_FILE = path.join(STORE_DIR, 'gmail-processed.json');

// Redis client (optional). Configure with REDIS_URL or REDIS_HOST/REDIS_PORT.
let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnected = false;
function getRedisUrl(): string | null {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ?? '6379';
  if (host) return `redis://${host}:${port}`;
  return null;
}

async function ensureRedis() {
  if (redisConnected) return redisClient;
  const url = getRedisUrl();
  if (!url) return null;

  const useTls = url.startsWith('rediss://');
  const u = new URL(url);

  // construct client with inline options (avoid any)
  const client = createClient({
    url,
    socket: useTls ? { tls: true, rejectUnauthorized: false, servername: u.hostname } : undefined,
  });

  try {
    await client.connect();
  } catch {
    try {
      await client.disconnect();
    } catch {}
    console.error('Failed to connect to Redis, falling back to file store');
    return null;
  }

  client.on('error', (err) => console.error('Redis error', err?.message ?? err));
  redisClient = client;
  redisConnected = true;
  console.log('Connected to Redis');
  return redisClient;
}

async function readStore(): Promise<Record<string, string>> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const txt = await fs.readFile(STORE_FILE, 'utf8');
    return JSON.parse(txt) as Record<string, string>;
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, string>) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

async function readProcessed(): Promise<Record<string, true>> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const txt = await fs.readFile(PROCESSED_FILE, 'utf8');
    return JSON.parse(txt) as Record<string, true>;
  } catch {
    return {};
  }
}

async function writeProcessed(p: Record<string, true>) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(PROCESSED_FILE, JSON.stringify(p, null, 2), 'utf8');
}

export async function POST(req: Request) {
  const body = (await req.json()) as PubSubMessage;

  console.log('=== PubSub push received ===');

  const payload = decodeBase64Json<GmailPushPayload>(body.message.data);

  if (!payload) {
    console.log('Unable to decode payload');
    return new Response('bad payload', { status: 400 });
  }

  console.log('Gmail push payload:', payload);

  const email = payload.emailAddress;
  const incomingHistory = payload.historyId;
  if (!email || !incomingHistory) {
    console.log('Missing email or historyId in payload');
    return new Response('bad payload', { status: 400 });
  }

  // Prefer Redis if configured; otherwise fall back to file store
  const r = await ensureRedis();
  async function getLastHistory(emailAddr: string): Promise<string | null> {
    if (r) {
      const val = await r.get(`gmail:history:${emailAddr}`);
      return val ?? null;
    }
    const s = await readStore();
    return s[emailAddr] ?? null;
  }

  async function setLastHistory(emailAddr: string, id: string): Promise<void> {
    if (r) {
      await r.set(`gmail:history:${emailAddr}`, id);
      return;
    }
    const s = await readStore();
    s[emailAddr] = id;
    await writeStore(s);
  }

  async function isProcessedId(emailAddr: string, msgId: string): Promise<boolean> {
    if (r) {
      const members = await r.sMembers(`gmail:processed:${emailAddr}`);
      return members.includes(msgId);
    }
    const p = await readProcessed();
    return Boolean(p[msgId]);
  }

  async function markProcessedId(emailAddr: string, msgId: string): Promise<void> {
    if (r) {
      await r.sAdd(`gmail:processed:${emailAddr}`, msgId);
      // set TTL on processed set to keep the processed list bounded
      await r.expire(`gmail:processed:${emailAddr}`, 60 * 60 * 24 * 30);
      return;
    }
    const p = await readProcessed();
    p[msgId] = true;
    await writeProcessed(p);
  }

  const store = await readStore();
  const prevHistory = await getLastHistory(email);

  // First time seeing this mailbox: persist and return
  if (!prevHistory) {
    await setLastHistory(email, incomingHistory);
    console.log(`Saved initial historyId for ${email}: ${incomingHistory}`);
    return new Response('ok', { status: 200 });
  }

  // If Google credentials are not configured, just persist incoming and exit
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    console.log('Google credentials missing; persisting historyId without fetching history');
    store[email] = incomingHistory;
    await writeStore(store);
    return new Response('ok', { status: 200 });
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ?? ''
  );

  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  try {
    const res = await gmail.users.history.list({ userId: 'me', startHistoryId: prevHistory });
    console.log('users.history.list result:', res.data);

    // Process history entries: collect message IDs and fetch messages
    const toProcess = new Set<string>();

    const histories = (res.data.history ?? []) as gmail_v1.Schema$History[];
    for (const h of histories) {
      if (Array.isArray(h.messagesAdded)) {
        for (const ma of h.messagesAdded) {
          if (ma?.message?.id) toProcess.add(ma.message.id as string);
        }
      }
      if (Array.isArray(h.messages)) {
        for (const m of h.messages) {
          if (m?.id) toProcess.add(m.id as string);
        }
      }
    }

    let processedCount = 0;
    for (const id of Array.from(toProcess)) {
      if (await isProcessedId(email, id)) continue; // already handled
      try {
        const msgRes = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
        console.log('Fetched message', id, 'snippet:', msgRes.data.snippet?.slice(0, 100));

        // TODO: persist message content to DB or process as needed

        await markProcessedId(email, id);
        processedCount += 1;
      } catch (fetchErr) {
        console.error('Failed to fetch message', id, fetchErr);
      }
    }

    // After successful processing, update stored historyId to the new one
    await setLastHistory(email, incomingHistory);

    return new Response(JSON.stringify({ ok: true, processed: processedCount }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: unknown) {
    const e = err as {
      message?: string;
      code?: number | string;
      response?: { status?: number; data?: unknown };
    };
    const message =
      typeof e?.message === 'string' ? e.message : typeof err === 'string' ? err : String(err);
    console.error('users.history.list error:', message);

    // If startHistoryId is too old or invalid, reset to incomingHistory
    const msg = e?.message ?? '';
    const code = e?.code;
    if (typeof msg === 'string' && msg.includes('startHistoryId')) {
      console.log('startHistoryId invalid or too old; resetting to incoming historyId');
      store[email] = incomingHistory;
      await writeStore(store);
      return new Response('ok', { status: 200 });
    }

    if (code === 404 || code === 400) {
      console.log('users.history.list returned code indicating invalid startHistoryId; resetting');
      store[email] = incomingHistory;
      await writeStore(store);
      return new Response('ok', { status: 200 });
    }

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
