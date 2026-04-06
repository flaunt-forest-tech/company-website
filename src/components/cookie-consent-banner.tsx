'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import {
  TRACKING_CONSENT_EVENT,
  getTrackingConsent,
  setTrackingConsent,
} from '@/lib/tracking-consent';

const bannerStyle = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 16,
  zIndex: 999,
  maxWidth: 760,
  margin: '0 auto',
  borderRadius: 18,
  border: '1px solid rgba(148,163,184,0.18)',
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94))',
  color: '#e5eefc',
  boxShadow: '0 20px 60px rgba(2, 6, 23, 0.35)',
  padding: 16,
} as const;

const buttonBaseStyle = {
  borderRadius: 10,
  padding: '9px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
} as const;

function subscribeToConsent(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => onStoreChange();

  window.addEventListener('storage', handler);
  window.addEventListener(TRACKING_CONSENT_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(TRACKING_CONSENT_EVENT, handler as EventListener);
  };
}

export default function CookieConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getTrackingConsent,
    () => 'pending' as const
  );

  if (consent !== null) {
    return null;
  }

  return (
    <div style={bannerStyle} role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
            Privacy & analytics choice
          </div>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, fontSize: 13 }}>
            We use optional analytics storage to understand repeat visits and improve the site. If
            you accept, we will store a browser ID for anonymous visit tracking. If you decline, the
            site still works normally without this tracking. Read more in our{' '}
            <Link href="/privacy" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
              Privacy & Cookies notice
            </Link>
            .
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setTrackingConsent('accepted');
            }}
            style={{
              ...buttonBaseStyle,
              border: '1px solid rgba(96,165,250,0.35)',
              background: 'rgba(96,165,250,0.16)',
              color: '#dbeafe',
            }}
          >
            Accept analytics
          </button>
          <button
            type="button"
            onClick={() => {
              setTrackingConsent('rejected');
            }}
            style={{
              ...buttonBaseStyle,
              border: '1px solid rgba(148,163,184,0.22)',
              background: 'transparent',
              color: '#cbd5e1',
            }}
          >
            Decline
          </button>
          <Link href="/privacy" style={{ color: '#93c5fd', fontSize: 13, fontWeight: 700 }}>
            Manage preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
