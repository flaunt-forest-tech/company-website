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

export async function POST(req: Request) {
  const body = (await req.json()) as PubSubMessage;

  console.log('=== PubSub push received ===');

  const payload = decodeBase64Json<GmailPushPayload>(body.message.data);

  if (!payload) {
    console.log('Unable to decode payload');
    return new Response('bad payload', { status: 400 });
  }

  console.log('Gmail push payload:', payload);

  /**
   * payload.emailAddress
   * payload.historyId
   *
   * 下一步我们就在这里：
   * → 存 historyId
   * → 调 users.history.list
   */

  return new Response('ok', { status: 200 });
}
