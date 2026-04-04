'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type UTMValues = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const STORAGE_KEY = 'fft_utm_attribution';

function readStoredUTM(): UTMValues {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UTMValues) : {};
  } catch {
    return {};
  }
}

function getUTMFromSearch(searchParams: URLSearchParams | ReadonlyURLSearchParams): UTMValues {
  return {
    utmSource: searchParams.get('utm_source') ?? undefined,
    utmMedium: searchParams.get('utm_medium') ?? undefined,
    utmCampaign: searchParams.get('utm_campaign') ?? undefined,
  };
}

function persistUTM(values: UTMValues): UTMValues {
  const nextValues = Object.fromEntries(
    Object.entries({ ...readStoredUTM(), ...values }).filter(([, value]) => Boolean(value))
  ) as UTMValues;

  if (typeof window !== 'undefined' && Object.keys(nextValues).length > 0) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextValues));
  }

  return nextValues;
}

function postAnalytics(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/track', blob);
    return;
  }

  void fetch('/api/analytics/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  });
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) {
      return;
    }

    const utmValues = persistUTM(getUTMFromSearch(searchParams));

    postAnalytics({
      eventType: 'page-view',
      pathname,
      referrer: document.referrer || null,
      ...utmValues,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) {
      return;
    }

    const utmValues = persistUTM(getUTMFromSearch(searchParams));

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const clickable = target.closest('a, button');
      if (!(clickable instanceof HTMLElement)) {
        return;
      }

      const rawLabel =
        clickable.getAttribute('data-analytics-label') ||
        clickable.getAttribute('aria-label') ||
        clickable.textContent?.replace(/\s+/g, ' ').trim();

      if (!rawLabel) {
        return;
      }

      const label = rawLabel.slice(0, 80);
      const href = clickable.getAttribute('href');

      postAnalytics({
        eventType: 'cta-click',
        pathname,
        label,
        target: href || null,
        ...utmValues,
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, searchParams]);

  return null;
}
