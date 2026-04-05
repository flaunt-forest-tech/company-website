import 'server-only';

import { createClient } from 'redis';

export type SharedRedisClient = ReturnType<typeof createClient>;

type RedisState = {
  client: SharedRedisClient | null;
  connectPromise: Promise<SharedRedisClient | null> | null;
  disabledUntil: number;
  lastError: string | null;
  lastLoggedError: string | null;
  lastLoggedAt: number;
};

declare global {
  var __fftRedisState: RedisState | undefined;
}

const redisState: RedisState =
  globalThis.__fftRedisState ??
  (globalThis.__fftRedisState = {
    client: null,
    connectPromise: null,
    disabledUntil: 0,
    lastError: null,
    lastLoggedError: null,
    lastLoggedAt: 0,
  });

export function formatRedisError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function normalizeRedisUrl(value: string): string {
  const trimmedValue = value.trim();

  if (/^redis(s)?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `redis://${trimmedValue}`;
}

export function getRedisUrl(): string | null {
  if (process.env.REDIS_URL) {
    return normalizeRedisUrl(process.env.REDIS_URL);
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ?? '6379';

  if (!host) {
    return null;
  }

  return `redis://${host}:${port}`;
}

async function safeDisconnect(client: SharedRedisClient | null): Promise<void> {
  if (!client) {
    return;
  }

  try {
    if (client.isOpen) {
      await client.quit();
      return;
    }
  } catch {
    // Fall through to disconnect.
  }

  try {
    client.disconnect();
  } catch {
    // Ignore disconnect issues during fallback cleanup.
  }
}

function logRedisWarning(message: string): void {
  const now = Date.now();

  if (redisState.lastLoggedError === message && now - redisState.lastLoggedAt < 15000) {
    return;
  }

  redisState.lastLoggedError = message;
  redisState.lastLoggedAt = now;
  console.error(message);
}

function createSharedClient(url: string): SharedRedisClient {
  const useTls = url.startsWith('rediss://');
  const skipTlsVerification = process.env.REDIS_TLS_INSECURE_SKIP_VERIFY === 'true';

  const client = createClient({
    url,
    ...(useTls
      ? {
          socket: {
            tls: true,
            rejectUnauthorized: !skipTlsVerification,
            servername: new URL(url).hostname,
          },
        }
      : {}),
  });

  client.on('error', (error) => {
    logRedisWarning(`Redis unavailable: ${formatRedisError(error)}`);
  });

  return client;
}

export async function resetSharedRedisClient(
  client: SharedRedisClient | null = redisState.client
): Promise<void> {
  redisState.client = null;
  await safeDisconnect(client);
}

export async function getSharedRedisClient(): Promise<SharedRedisClient | null> {
  if (redisState.client?.isOpen) {
    return redisState.client;
  }

  if (redisState.connectPromise) {
    return redisState.connectPromise;
  }

  const url = getRedisUrl();

  if (!url) {
    return null;
  }

  if (Date.now() < redisState.disabledUntil) {
    return null;
  }

  redisState.connectPromise = (async () => {
    const client = createSharedClient(url);

    try {
      await client.connect();
      redisState.client = client;
      redisState.lastError = null;
      return client;
    } catch (error) {
      const message = formatRedisError(error);
      redisState.lastError = message;
      redisState.disabledUntil =
        Date.now() + (/max number of clients reached/i.test(message) ? 60000 : 15000);
      logRedisWarning(`Redis connection skipped, using fallback storage: ${message}`);
      await safeDisconnect(client);
      return null;
    } finally {
      redisState.connectPromise = null;
    }
  })();

  return redisState.connectPromise;
}
