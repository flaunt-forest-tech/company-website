export const TRACKING_CONSENT_KEY = 'fft_tracking_consent';
export const TRACKING_CONSENT_EVENT = 'fft-tracking-consent-changed';
export const VISITOR_STORAGE_KEY = 'fft_visitor_id';
export const UTM_STORAGE_KEY = 'fft_utm_attribution';

export type TrackingConsentStatus = 'accepted' | 'rejected';

function readConsentCookie(): TrackingConsentStatus | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${TRACKING_CONSENT_KEY.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}=([^;]*)`
    )
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;

  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function getTrackingConsent(): TrackingConsentStatus | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(TRACKING_CONSENT_KEY)?.trim();

    if (stored === 'accepted' || stored === 'rejected') {
      return stored;
    }
  } catch {
    // Fall back to cookie.
  }

  return readConsentCookie();
}

export function hasTrackingConsent(): boolean {
  return getTrackingConsent() === 'accepted';
}

export function setTrackingConsent(status: TrackingConsentStatus): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(TRACKING_CONSENT_KEY, status);
  } catch {
    // Ignore storage errors.
  }

  document.cookie = `${TRACKING_CONSENT_KEY}=${encodeURIComponent(status)}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`;

  if (status === 'rejected') {
    try {
      window.localStorage.removeItem(VISITOR_STORAGE_KEY);
      window.sessionStorage.removeItem(UTM_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors.
    }
  }

  window.dispatchEvent(new CustomEvent(TRACKING_CONSENT_EVENT, { detail: status }));
}

export function clearTrackingIdentifiers(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(VISITOR_STORAGE_KEY);
    window.sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Ignore cleanup errors.
  }
}
