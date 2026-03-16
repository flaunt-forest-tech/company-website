import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from 'redis';

async function main() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.error('REDIS_URL not set');
    process.exit(2);
  }

  const useTls = url.startsWith('rediss://');
  const clientOpts = { url };
  if (useTls) {
    const u = new URL(url);
    clientOpts.socket = { tls: true, rejectUnauthorized: false, servername: u.hostname };
  }
  const client = createClient(clientOpts);
  client.on('error', (e) => console.error('Redis client error', e));
  await client.connect();

  const keys = await client.keys('gmail:*');
  console.log('Found keys:', keys);

  for (const k of keys) {
    if (k.startsWith('gmail:processed:')) {
      const members = await client.sMembers(k);
      console.log(k, 'members count=', members.length, 'sample=', members.slice(0, 10));
    } else {
      const v = await client.get(k);
      console.log(k, 'value=', v);
    }
  }

  await client.quit();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
