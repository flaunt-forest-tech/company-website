'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

import { trackConversion } from '@/lib/analytics';
import { getLeadScore, getLeadTemperature, sendLeadAlert } from '@/lib/lead-alerts';
import { getSharedRedisClient } from '@/lib/redis';
import { extractClientIp } from '@/lib/request-ip';

import { ContactFormInputs } from '../contact/page';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>';
const contactEmailTo = process.env.CONTACT_TO_EMAIL || 'sales@flauntforest.com';
const leadAlertEmailTo = process.env.LEAD_ALERT_TO_EMAIL || 'flauntforesttech@gmail.com';

// In-memory fallback when Redis is not configured.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per minute
const RATE_LIMIT_PREFIX = 'rate:contact';

function normalizeOrigin(value: string): string | null {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function getAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();

  const explicitOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
  for (const origin of explicitOrigins) {
    const normalized = normalizeOrigin(origin.trim());
    if (normalized) allowed.add(normalized);
  }

  const publicSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicSite) {
    const normalized = normalizeOrigin(publicSite);
    if (normalized) allowed.add(normalized);
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) {
    const normalized = normalizeOrigin(`https://${vercelProd}`);
    if (normalized) allowed.add(normalized);
  }

  const vercelPreview = process.env.VERCEL_URL;
  if (vercelPreview) {
    const normalized = normalizeOrigin(`https://${vercelPreview}`);
    if (normalized) allowed.add(normalized);
  }

  return allowed;
}

function isOriginAllowed(value: string | null, allowedOrigins: Set<string>): boolean {
  if (!value) return false;
  const normalized = normalizeOrigin(value);
  if (!normalized) return false;
  return allowedOrigins.has(normalized);
}

function validateRequestOrigin(
  reqHeaders: Headers,
  allowedOrigins: Set<string>
): { valid: boolean; error?: string } {
  if (process.env.NODE_ENV !== 'production') {
    return { valid: true };
  }

  if (allowedOrigins.size === 0) {
    return { valid: false, error: 'Origin validation not configured' };
  }

  const origin = reqHeaders.get('origin');
  if (!isOriginAllowed(origin, allowedOrigins)) {
    return { valid: false, error: 'Invalid origin' };
  }

  const referer = reqHeaders.get('referer');
  if (referer && !isOriginAllowed(referer, allowedOrigins)) {
    return { valid: false, error: 'Invalid referer' };
  }

  return { valid: true };
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
  const redis = await getSharedRedisClient();
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
  const allowedOrigins = getAllowedOrigins();
  const originValidation = validateRequestOrigin(requestHeaders, allowedOrigins);
  if (!originValidation.valid) {
    return { success: false, error: 'Invalid request source' };
  }

  const clientIp = extractClientIp(requestHeaders) ?? 'unknown-ip';

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
  const sourcePage = escapeHtml(
    (formData.sourcePage || requestHeaders.get('referer') || 'Unknown').trim()
  );
  const utmSource = escapeHtml((formData.utmSource || 'direct').trim());
  const utmMedium = escapeHtml((formData.utmMedium || 'none').trim());
  const utmCampaign = escapeHtml((formData.utmCampaign || 'none').trim());
  const leadScore = getLeadScore({
    name: formData.name,
    email: senderEmail,
    phone: formData.phone,
    inquiryType: formData.inquiryType,
    subject: formData.subject,
    message: formData.message,
    sourcePage: formData.sourcePage || requestHeaders.get('referer'),
    utmSource: formData.utmSource,
    utmMedium: formData.utmMedium,
    utmCampaign: formData.utmCampaign,
  });
  const leadTemperature = getLeadTemperature(leadScore);
  const subject = `[${inquiryType}] ${subjectEscaped} | ${name}`;
  const html = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Project Focus:</strong> ${inquiryType}</p>
    <p><strong>Subject:</strong> ${subjectEscaped}</p>
    <p><strong>Lead Score:</strong> ${leadScore}/100 (${leadTemperature})</p>
    <p><strong>Source Page:</strong> ${sourcePage}</p>
    <p><strong>UTM:</strong> ${utmSource} / ${utmMedium} / ${utmCampaign}</p>
    <hr/>
    <p>${messageEscaped}</p>
  `;

  try {
    const recipients = Array.from(new Set([contactEmailTo, leadAlertEmailTo]));

    const data = await resend.emails.send({
      from: emailFrom,
      to: recipients,
      replyTo: senderEmail,
      subject: subject,
      html,
    });

    await trackConversion({
      type: 'contact-form',
      inquiryType: formData.inquiryType,
      name: formData.name,
      email: senderEmail,
      phone: formData.phone,
      sourcePage: formData.sourcePage || requestHeaders.get('referer'),
      utmSource: formData.utmSource,
      utmMedium: formData.utmMedium,
      utmCampaign: formData.utmCampaign,
      visitorId: formData.visitorId,
      ipAddress: clientIp,
      userAgent: requestHeaders.get('user-agent'),
    });

    await sendLeadAlert({
      name: formData.name,
      email: senderEmail,
      phone: formData.phone,
      inquiryType: formData.inquiryType,
      subject: formData.subject,
      message: formData.message,
      sourcePage: formData.sourcePage || requestHeaders.get('referer'),
      utmSource: formData.utmSource,
      utmMedium: formData.utmMedium,
      utmCampaign: formData.utmCampaign,
    });

    return { success: true, data };
  } catch {
    // Log error but don't expose sensitive details to client
    console.error('Email send error: Failed to send email');
    return { success: false, error: 'Failed to send email. Please try again.' };
  }
}
