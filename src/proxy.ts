import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import {
  isMaintenancePath,
  isStorefrontMaintenanceEnabled,
  shouldSkipMaintenanceRedirect,
} from '@/lib/maintenance/storefront-maintenance';

/**
 * Server-side gates:
 * 1. Storefront maintenance mode → redirect to /maintenance
 * 2. Account routes require cookie presence (parity with admin `proxy.ts`)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldSkipMaintenanceRedirect(pathname)) {
    const maintenanceEnabled = await isStorefrontMaintenanceEnabled();
    if (maintenanceEnabled) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  if (isMaintenancePath(pathname)) {
    // Fresh backend check — do not trust the short-lived proxy cache here.
    const maintenanceEnabled = await isStorefrontMaintenanceEnabled(fetch, {
      bypassCache: true,
    });
    if (!maintenanceEnabled) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/user' || pathname.startsWith('/user/')) {
    const accessToken =
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ??
      request.cookies.get(`__Host-${ACCESS_TOKEN_COOKIE}`)?.value;
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next internals and common static assets.
     * Maintenance + auth logic apply additional skips in-function.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
};
