import { NextResponse } from 'next/server';

import { getClearedAdminSessionCookie } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
  const sessionCookie = getClearedAdminSessionCookie();

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  return response;
}
