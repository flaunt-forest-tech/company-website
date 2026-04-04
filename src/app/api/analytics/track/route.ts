import { trackClickEvent, trackPageView } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function decodeHeaderValue(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value.trim();
  }
}

function getLocationLabel(headers: Headers): string | null {
  const city = decodeHeaderValue(headers.get('x-vercel-ip-city'));
  const region = decodeHeaderValue(headers.get('x-vercel-ip-country-region'));
  const countryCode = decodeHeaderValue(
    headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry')
  );

  let country = countryCode;
  if (countryCode && countryCode.length === 2) {
    try {
      country =
        new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode.toUpperCase()) ??
        countryCode;
    } catch {
      country = countryCode;
    }
  }

  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

function getCompanyHint(headers: Headers): string | null {
  return decodeHeaderValue(
    headers.get('x-vercel-ip-as-organization') ??
      headers.get('cf-connecting-organization') ??
      headers.get('x-forwarded-company') ??
      headers.get('x-real-company')
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as {
      pathname?: string;
      referrer?: string | null;
      eventType?: 'page-view' | 'cta-click';
      label?: string | null;
      target?: string | null;
      utmSource?: string | null;
      utmMedium?: string | null;
      utmCampaign?: string | null;
    };

    const requestHeaders = request.headers;
    const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = requestHeaders.get('x-real-ip')?.trim();

    if (payload.eventType === 'cta-click') {
      await trackClickEvent({
        label: payload.label,
        pathname: payload.pathname || '/',
        target: payload.target,
      });

      return new Response(null, { status: 204 });
    }

    await trackPageView({
      pathname: payload.pathname || '/',
      ipAddress: forwardedFor || realIp || null,
      userAgent: requestHeaders.get('user-agent'),
      referrer: payload.referrer || requestHeaders.get('referer'),
      location: getLocationLabel(requestHeaders),
      company: getCompanyHint(requestHeaders),
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Analytics tracking failed', error);
    return Response.json({ ok: false }, { status: 200 });
  }
}
