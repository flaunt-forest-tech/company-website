import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_SESSION_COOKIE = 'fft_admin_session';
export const ADMIN_LOGIN_PATH = '/admin/login';

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAdminUsername(): string {
  return process.env.ADMIN_DASHBOARD_USERNAME?.trim() || '';
}

function getAdminPassword(): string {
  return process.env.ADMIN_DASHBOARD_PASSWORD?.trim() || '';
}

function getSessionSeed(): string {
  return (
    process.env.ADMIN_DASHBOARD_SECRET?.trim() ||
    process.env.ADMIN_DASHBOARD_PASSWORD?.trim() ||
    'local-admin-session'
  );
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminUsername() && getAdminPassword());
}

function buildSessionValue(): string {
  return crypto
    .createHash('sha256')
    .update(`${getAdminUsername()}:${getAdminPassword()}:${getSessionSeed()}`)
    .digest('hex');
}

export function validateAdminCredentials(username: string, password: string): boolean {
  if (!isAdminConfigured()) {
    return false;
  }

  return safeEqual(username.trim(), getAdminUsername()) && safeEqual(password, getAdminPassword());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return false;
  }

  return safeEqual(cookieValue, buildSessionValue());
}

export async function requireAdminAccess(): Promise<void> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect(ADMIN_LOGIN_PATH);
  }
}

export function getAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: buildSessionValue(),
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    },
  };
}

export function getClearedAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    },
  };
}
