export function extractClientIp(headers: Headers): string | null {
  const forwardedHeader = headers.get('forwarded');
  const forwardedMatch = forwardedHeader?.match(/for=(?:"?\[?)([^;,"]+)/i)?.[1] ?? null;

  const candidates = [
    headers.get('x-vercel-forwarded-for'),
    headers.get('x-forwarded-for'),
    headers.get('cf-connecting-ip'),
    headers.get('x-real-ip'),
    headers.get('x-client-ip'),
    forwardedMatch,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIpCandidate(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function formatClientIpLabel(value?: string | null): string | null {
  const normalized = normalizeIpCandidate(value);

  if (!normalized) {
    return null;
  }

  const lowercase = normalized.toLowerCase();

  if (lowercase === '::1' || lowercase === '127.0.0.1' || lowercase === 'localhost') {
    return 'Localhost (dev)';
  }

  return normalized.slice(0, 120);
}

function normalizeIpCandidate(value?: string | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const firstEntry = trimmed.split(',')[0]?.trim() ?? '';
  const extracted = firstEntry.replace(/^for=/i, '').replace(/^"|"$/g, '').trim();
  const unwrapped = extracted.replace(/^\[|\]$/g, '');
  const withoutIpv4Prefix = unwrapped.replace(/^::ffff:/i, '');

  return withoutIpv4Prefix || null;
}
