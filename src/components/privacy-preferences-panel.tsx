'use client';

import { useSyncExternalStore } from 'react';

import {
  TRACKING_CONSENT_EVENT,
  getTrackingConsent,
  setTrackingConsent,
} from '@/lib/tracking-consent';

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

export default function PrivacyPreferencesPanel() {
  const consent = useSyncExternalStore(subscribeToConsent, getTrackingConsent, () => null);

  return (
    <div
      style={{
        borderRadius: '16px',
        padding: '18px',
        background: 'rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(148,163,184,0.18)',
      }}
    >
      <h3 className="text-5 mb-3">Manage analytics preference</h3>
      <p className="mb-3 text-4 line-height-7">
        Current choice:{' '}
        <strong>
          {consent === 'accepted'
            ? 'Accepted analytics'
            : consent === 'rejected'
              ? 'Declined analytics'
              : 'Not chosen yet'}
        </strong>
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setTrackingConsent('accepted')}
          style={{
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(96,165,250,0.35)',
            background: 'rgba(96,165,250,0.12)',
            color: '#1d4ed8',
          }}
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => setTrackingConsent('rejected')}
          style={{
            borderRadius: '10px',
            padding: '9px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid rgba(148,163,184,0.25)',
            background: '#fff',
            color: '#334155',
          }}
        >
          Decline analytics
        </button>
      </div>
    </div>
  );
}
