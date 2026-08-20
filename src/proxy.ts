import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSafeRedirect } from '@/lib/auth/safe-redirect';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { verifyJwtPayload } from '@/lib/jwt';

/**
 * Server-side gate for account routes (parity with admin `proxy.ts`).
 * Client AccountAuthGuard remains for UX; this blocks unauthenticated HTML entry.
 */
export async function proxy(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const nextPath = getSafeRedirect(request.nextUrl.pathname);
  if (nextPath) {
    loginUrl.searchParams.set('next', nextPath);
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.redirect(loginUrl);
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    // Production must fail closed when the signing secret is not configured.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(loginUrl);
    }
    // Local/dev without JWT_SECRET: cookie presence only (DX).
    return NextResponse.next();
  }

  const payload = await verifyJwtPayload(accessToken);
  if (!payload) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*'],
};
