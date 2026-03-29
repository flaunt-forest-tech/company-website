'use server';

import { headers } from 'next/headers';
import { createClient } from 'redis';
import { Resend } from 'resend';
import { ContactFormInputs } from '../contact/page';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>';
const emailTo = process.env.CONTACT_TO_EMAIL || 'sales@flauntforest.com';

// In-memory fallback when Redis is not configured.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per minute
const RATE_LIMIT_PREFIX = 'rate:contact';

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
    console.error('Failed to connect to Redis, falling back to in-memory rate limiting');
    return null;
  }

  client.on('error', (err) =>
    console.error('Redis error', err instanceof Error ? err.message : err)
  );

  redisClient = client;
  redisConnected = true;
  return redisClient;
}

function pickClientIp(forwardedFor: string | null, realIp: string | null): string {
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  if (realIp) return realIp;
  return 'unknown-ip';
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100 && email.length >= 5;
}

// Validate input lengths
function validateFormInputs(data: ContactFormInputs): { valid: boolean; error?: string } {
  const constraints = {
    name: { min: 2, max: 100 },
    phone: { min: 5, max: 20 },
    email: { min: 5, max: 100 },
    inquiryType: { min: 2, max: 100 },
    subject: { min: 3, max: 100 },
    message: { min: 10, max: 5000 },
  };

  for (const [field, { min, max }] of Object.entries(constraints)) {
    const value = data[field as keyof ContactFormInputs];
    if (!value || value.length < min || value.length > max) {
      return { valid: false, error: `Invalid ${field} length` };
    }
  }

  if (!isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

// In-memory rate limit fallback.
function checkMemoryRateLimit(clientId: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const times = requestLog.get(clientId) || [];

  // Clean old entries
  const recentTimes = times.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recentTimes.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, error: 'Too many requests. Please try again later.' };
  }

  recentTimes.push(now);
  requestLog.set(clientId, recentTimes);

  // Clean up very old entries to prevent memory leak
  if (requestLog.size > 10000) {
    const firstKey = requestLog.keys().next().value;
    if (firstKey !== undefined) {
      requestLog.delete(firstKey);
    }
  }

  return { allowed: true };
}

async function checkRateLimit(clientIp: string): Promise<{ allowed: boolean; error?: string }> {
  const redis = await ensureRedis();
  const key = `${RATE_LIMIT_PREFIX}:${clientIp}`;

  if (redis) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.floor(RATE_LIMIT_WINDOW / 1000));
      }

      if (current > MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, error: 'Too many requests. Please try again later.' };
      }

      return { allowed: true };
    } catch {
      console.error('Redis rate limit check failed, using in-memory fallback');
    }
  }

  return checkMemoryRateLimit(clientIp);
}

export async function sendEmail(formData: ContactFormInputs & { honeypot?: string }) {
  // Honeypot check
  if (formData.honeypot) {
    return { success: false, error: 'Invalid submission' };
  }

  const requestHeaders = await headers();
  const clientIp = pickClientIp(
    requestHeaders.get('x-forwarded-for'),
    requestHeaders.get('x-real-ip')
  );

  // Rate limiting by client IP.
  const rateCheck = await checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.error };
  }

  // Validate inputs
  const validation = validateFormInputs(formData);
  if (!validation.valid) {
    return { success: false, error: 'Invalid input data' };
  }

  const senderEmail = formData.email.trim().toLowerCase();
  const email = escapeHtml(senderEmail);
  const phone = escapeHtml(formData.phone.trim());
  const name = escapeHtml(formData.name.trim());
  const inquiryType = escapeHtml(formData.inquiryType.trim());
  const messageEscaped = escapeHtml(formData.message.trim()).replace(/\n/g, '<br/>');
  const subjectEscaped = escapeHtml(formData.subject.trim());
  const subject = `[${inquiryType}] ${subjectEscaped} | ${name}`;
  const html = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Consultation Goal:</strong> ${inquiryType}</p>
    <p><strong>Subject:</strong> ${subjectEscaped}</p>
    <hr/>
    <p>${messageEscaped}</p>
  `;

  try {
    const data = await resend.emails.send({
      from: emailFrom,
      to: [emailTo],
      replyTo: senderEmail,
      subject: subject,
      html,
    });
    return { success: true, data };
  } catch (error: unknown) {
    // Log error but don't expose sensitive details to client
    console.error('Email send error: Failed to send email');
    return { success: false, error: 'Failed to send email. Please try again.' };
  }
}
