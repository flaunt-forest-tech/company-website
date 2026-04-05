import { NextResponse } from 'next/server';

import { getAdminSessionCookie, validateAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!validateAdminCredentials(username, password)) {
    const loginUrl = new URL('/admin/login?error=1', request.url);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  const sessionCookie = getAdminSessionCookie();

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  return response;
}
