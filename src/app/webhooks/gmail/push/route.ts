export const runtime = 'nodejs';

/**
 * Pub/Sub push body format (JSON):
 * {
 *   "message": {
 *     "data": "base64...",
 *     "messageId": "...",
 *     "attributes": {...}
 *   },
 *   "subscription": "projects/.../subscriptions/..."
 * }
 */
interface PubSubMessage {
  message?: {
    data?: string;
    messageId?: string;
    attributes?: Record<string, string>;
  };
  subscription?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as PubSubMessage;

  console.log('=== PubSub push received ===');
  console.log('raw body:', body);

  // Decode message.data (base64) if present
  try {
    const dataB64 = body?.message?.data;
    if (typeof dataB64 === 'string') {
      const decoded = Buffer.from(dataB64, 'base64').toString('utf8');
      console.log('decoded message.data:', decoded);

      // If decoded is JSON, parse it
      try {
        const parsed = JSON.parse(decoded);
        console.log('decoded JSON:', parsed);
      } catch {
        // not JSON, ignore
      }
    }
  } catch (e) {
    console.log('decode error:', String(e));
  }

  // IMPORTANT: respond quickly
  return new Response('ok', { status: 200 });
}
