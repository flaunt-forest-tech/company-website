// src/app/webhooks/gmail/push/route.ts

import { timingSafeEqual } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { google, gmail_v1 } from 'googleapis';
import { createClient } from 'redis';
import { PubSubMessage, GmailPushPayload } from './types';

export const runtime = 'nodejs';

/** Pub/Sub message.data is base64(JSON-string) */
function decodeBase64Json<T>(b64: string): T | null {
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

/** Gmail body parts are base64url (not normal base64) */
function decodeBase64UrlToUtf8(data: string) {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getHeaderValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, key: string) {
  if (!headers) return '';
  const found = headers.find((h) => (h.name || '').toLowerCase() === key.toLowerCase());
  return found?.value || '';
}

/** Extract the best body we can find (prefer text/plain, fallback to text/html, recurse multipart) */
function extractBodyText(payload: gmail_v1.Schema$MessagePart | null | undefined): {
  text: string;
  mimeType: string;
} {
  if (!payload) return { text: '', mimeType: '' };

  // Single-part
  if (payload.body?.data) {
    return {
      text: decodeBase64UrlToUtf8(payload.body.data),
      mimeType: payload.mimeType || '',
    };
  }

  const parts: gmail_v1.Schema$MessagePart[] = payload.parts || [];
  if (!Array.isArray(parts) || parts.length === 0) {
    return { text: '', mimeType: '' };
  }

  // Prefer text/plain
  const plain = parts.find((p) => p?.mimeType === 'text/plain' && p?.body?.data);
  if (plain?.body?.data) {
    return {
      text: decodeBase64UrlToUtf8(plain.body.data),
      mimeType: 'text/plain',
    };
  }

  // Fallback to text/html
  const html = parts.find((p) => p?.mimeType === 'text/html' && p?.body?.data);
  if (html?.body?.data) {
    return {
      text: decodeBase64UrlToUtf8(html.body.data),
      mimeType: 'text/html',
    };
  }

  // Nested multipart
  for (const p of parts) {
    const nested = extractBodyText(p);
    if (nested.text) return nested;
  }

  return { text: '', mimeType: '' };
}

function stripHtmlToText(htmlOrText: string) {
  return htmlOrText
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function parseEmailAddress(fromHeader: string) {
  // "Name <email@x.com>" -> email@x.com
  const match = fromHeader.match(/<([^>]+)>/);
  return (match?.[1] || fromHeader).trim();
}

function safeCompare(secret: string, incoming: string | null) {
  if (!incoming) return false;

  const left = Buffer.from(secret, 'utf8');
  const right = Buffer.from(incoming, 'utf8');

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

function isPubSubMessage(value: unknown): value is PubSubMessage {
  if (!value || typeof value !== 'object') return false;

  const maybe = value as Partial<PubSubMessage>;
  const message = maybe.message;

  return Boolean(
    message &&
      typeof message === 'object' &&
      typeof message.data === 'string' &&
      typeof message.messageId === 'string' &&
      typeof message.publishTime === 'string'
  );
}

function isGmailPushPayload(value: unknown): value is GmailPushPayload {
  if (!value || typeof value !== 'object') return false;

  const maybe = value as Partial<GmailPushPayload>;
  return typeof maybe.emailAddress === 'string' && typeof maybe.historyId === 'string';
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'invalid-email';

  const visibleLocal = local.length <= 2 ? `${local[0] ?? '*'}*` : `${local.slice(0, 2)}***`;
  return `${visibleLocal}@${domain}`;
}

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'gmail-history.json');
const PROCESSED_FILE = path.join(STORE_DIR, 'gmail-processed.json');

// Redis client (optional). Configure with REDIS_URL or REDIS_HOST/REDIS_PORT.
let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnected = false;

function normalizeRedisUrl(value: string): string {
  const trimmedValue = value.trim();
  if (/^redis(s)?:\/\//i.test(trimmedValue)) return trimmedValue;
  return `redis://${trimmedValue}`;
}

function getRedisUrl(): string | null {
  if (process.env.REDIS_URL) return normalizeRedisUrl(process.env.REDIS_URL);
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
  const skipTlsVerification = process.env.REDIS_TLS_INSECURE_SKIP_VERIFY === 'true';

  const client = createClient({
    url,
    socket: useTls
      ? {
          tls: true,
          rejectUnauthorized: !skipTlsVerification,
          servername: u.hostname,
        }
      : undefined,
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

  client.on('error', (err) =>
    console.error('Redis error', err instanceof Error ? err.message : err)
  );

  redisClient = client;
  redisConnected = true;
  console.log(
    `Connected to Redis${skipTlsVerification ? ' with insecure TLS verification disabled' : ''}`
  );
  return redisClient;
}

type HistoryStore = Record<string, string>; // emailAddress -> lastHistoryId
type ProcessedStore = Record<string, Record<string, true>>; // emailAddress -> { msgId: true }

// -------- File store helpers (fallback only) --------
async function readStore(): Promise<HistoryStore> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const txt = await fs.readFile(STORE_FILE, 'utf8');
    return JSON.parse(txt) as HistoryStore;
  } catch {
    return {};
  }
}

async function writeStore(store: HistoryStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

async function readProcessed(): Promise<ProcessedStore> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const txt = await fs.readFile(PROCESSED_FILE, 'utf8');
    return JSON.parse(txt) as ProcessedStore;
  } catch {
    return {};
  }
}

async function writeProcessed(p: ProcessedStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(PROCESSED_FILE, JSON.stringify(p, null, 2), 'utf8');
}

export async function POST(req: Request) {
  console.log('=== PubSub push received ===');

  const secret = process.env.WEBHOOK_SECRET?.trim() || '';
  const requireSecret = process.env.NODE_ENV === 'production';

  if (requireSecret && !secret) {
    console.error('WEBHOOK_SECRET is required for gmail push webhook in production');
    return new Response('server misconfigured', { status: 500 });
  }

  if (secret) {
    if (!safeCompare(secret, req.headers.get('x-webhook-secret'))) {
      console.log('Unauthorized webhook call (secret mismatch)');
      return new Response('unauthorized', { status: 401 });
    }
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return new Response('unsupported media type', { status: 415 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  if (!isPubSubMessage(body)) {
    return new Response('bad payload', { status: 400 });
  }

  const payload = decodeBase64Json<unknown>(body.message.data);

  if (!payload || !isGmailPushPayload(payload)) {
    console.log('Unable to decode payload');
    return new Response('bad payload', { status: 400 });
  }

  const email = payload.emailAddress;
  const incomingHistory = payload.historyId;

  if (!email || !incomingHistory || !looksLikeEmail(email)) {
    console.log('Missing email or historyId in payload');
    return new Response('bad payload', { status: 400 });
  }

  console.log('Processing Gmail push payload', {
    email: maskEmail(email),
    historyId: incomingHistory,
    messageId: body.message.messageId,
  });

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
      return Boolean(await r.sIsMember(`gmail:processed:${emailAddr}`, msgId));
    }
    const p = await readProcessed();
    return Boolean(p[emailAddr]?.[msgId]);
  }

  async function markProcessedId(emailAddr: string, msgId: string): Promise<void> {
    if (r) {
      await r.sAdd(`gmail:processed:${emailAddr}`, msgId);
      await r.expire(`gmail:processed:${emailAddr}`, 60 * 60 * 24 * 30);
      return;
    }
    const p = await readProcessed();
    p[emailAddr] = p[emailAddr] ?? {};
    p[emailAddr]![msgId] = true;
    await writeProcessed(p);
  }

  const prevHistory = await getLastHistory(email);

  // First time seeing this mailbox: persist and return
  if (!prevHistory) {
    await setLastHistory(email, incomingHistory);
    console.log(`Saved initial historyId for ${maskEmail(email)}: ${incomingHistory}`);
    return new Response('ok', { status: 200 });
  }

  // If Google credentials are not configured, just persist incoming and exit
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    console.log('Google credentials missing; persisting historyId without fetching history');
    await setLastHistory(email, incomingHistory);
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
    const res = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: prevHistory,
    });

    const toProcess = new Set<string>();
    const histories = (res.data.history ?? []) as gmail_v1.Schema$History[];

    console.log('Fetched Gmail history delta', {
      email: maskEmail(email),
      historyCount: histories.length,
      startHistoryId: prevHistory,
      incomingHistoryId: incomingHistory,
    });

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
      if (await isProcessedId(email, id)) continue;

      try {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'full',
        });

        // --- Step 2: parse headers + body ---
        const msgPayload = msgRes.data.payload;
        const headers = msgPayload?.headers || [];

        const from = getHeaderValue(headers, 'From');
        const subject = getHeaderValue(headers, 'Subject');
        const messageId = getHeaderValue(headers, 'Message-ID');
        const threadId = msgRes.data.threadId || '';

        const { text: rawBody, mimeType } = extractBodyText(msgPayload);
        const bodyText = mimeType === 'text/html' ? stripHtmlToText(rawBody) : rawBody.trim();

        const fromEmail = parseEmailAddress(from);

        console.log('Fetched message parsed:', {
          id,
          threadId,
          fromEmail: looksLikeEmail(fromEmail) ? maskEmail(fromEmail) : 'invalid-email',
          subjectLength: subject.length,
          messageId: messageId ? 'present' : 'missing',
          mimeType,
          bodyLength: bodyText.length,
        });

        // TODO Step 3: call Gemini to draft reply using (fromEmail, subject, bodyText)
        // TODO Step 4: send threaded reply using (threadId, messageId)

        await markProcessedId(email, id);
        processedCount += 1;
      } catch (fetchErr) {
        console.error('Failed to fetch message', id, fetchErr);
      }
    }

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
      await setLastHistory(email, incomingHistory);
      return new Response('ok', { status: 200 });
    }

    if (code === 404 || code === 400) {
      console.log('users.history.list returned code indicating invalid startHistoryId; resetting');
      await setLastHistory(email, incomingHistory);
      return new Response('ok', { status: 200 });
    }

    const errorOut = process.env.NODE_ENV === 'production' ? 'Internal server error' : message;

    return new Response(JSON.stringify({ ok: false, error: errorOut }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
