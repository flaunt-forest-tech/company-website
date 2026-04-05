'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_SECONDS = 30;

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'grid',
  placeItems: 'center',
  padding: '20px',
  background: 'rgba(2, 6, 23, 0.72)',
  backdropFilter: 'blur(6px)',
} as const;

const dialogStyle = {
  width: '100%',
  maxWidth: '460px',
  borderRadius: '20px',
  padding: '22px',
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94))',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.42)',
  color: '#e5eefc',
} as const;

const buttonBaseStyle = {
  borderRadius: '12px',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid transparent',
} as const;

export default function AdminIdleGuard() {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);
  const idleTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const hasLoggedOutRef = useRef(false);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const logoutNow = useCallback(async () => {
    if (hasLoggedOutRef.current) {
      return;
    }

    hasLoggedOutRef.current = true;
    clearIdleTimer();
    clearCountdownTimer();

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Ignore network issues and still return to login.
    }

    window.location.href = '/admin/login?expired=1';
  }, [clearCountdownTimer, clearIdleTimer]);

  const scheduleIdlePrompt = useCallback(() => {
    if (hasLoggedOutRef.current) {
      return;
    }

    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      setIsPromptOpen(true);
      setSecondsLeft(WARNING_SECONDS);
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimer]);

  const staySignedIn = useCallback(() => {
    setIsPromptOpen(false);
    setSecondsLeft(WARNING_SECONDS);
    clearCountdownTimer();
    scheduleIdlePrompt();
  }, [clearCountdownTimer, scheduleIdlePrompt]);

  useEffect(() => {
    scheduleIdlePrompt();

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    const handleActivity = () => {
      if (!isPromptOpen) {
        scheduleIdlePrompt();
      }
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      clearIdleTimer();
    };
  }, [clearIdleTimer, isPromptOpen, scheduleIdlePrompt]);

  useEffect(() => {
    if (!isPromptOpen) {
      clearCountdownTimer();
      return;
    }

    countdownTimerRef.current = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearCountdownTimer();
          void logoutNow();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      clearCountdownTimer();
    };
  }, [clearCountdownTimer, isPromptOpen, logoutNow]);

  if (!isPromptOpen) {
    return null;
  }

  return (
    <div style={overlayStyle} role="alertdialog" aria-modal="true" aria-labelledby="idle-title">
      <div style={dialogStyle}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            padding: '6px 10px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.14)',
            color: '#fcd34d',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          Session idle warning
        </div>

        <h2 id="idle-title" style={{ margin: '0 0 8px', fontSize: '26px' }}>
          Stay signed in?
        </h2>
        <p style={{ margin: '0 0 14px', color: '#c7d4ea', lineHeight: 1.7 }}>
          There has been no activity for 30 minutes. For security, this admin session will close in{' '}
          <strong>{secondsLeft}s</strong> unless you confirm you want to stay.
        </p>

        <div
          style={{
            height: '8px',
            borderRadius: '999px',
            background: 'rgba(30, 41, 59, 0.9)',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: `${(secondsLeft / WARNING_SECONDS) * 100}%`,
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              void logoutNow();
            }}
            style={{
              ...buttonBaseStyle,
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#e5eefc',
              borderColor: 'rgba(148, 163, 184, 0.18)',
            }}
          >
            Leave now
          </button>
          <button
            type="button"
            onClick={staySignedIn}
            style={{
              ...buttonBaseStyle,
              background: '#2563eb',
              color: '#ffffff',
            }}
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
