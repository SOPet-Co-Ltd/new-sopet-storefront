import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_DAYS,
  AUTH_COMPANION_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_DAYS,
} from '@/lib/config';

const ACCESS_MAX_AGE_SECONDS = Math.round(ACCESS_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60);
const REFRESH_MAX_AGE_SECONDS = Math.round(REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60);

function isSecureRequest(request?: Request): boolean {
  if (request) {
    try {
      return new URL(request.url).protocol === 'https:';
    } catch {
      return process.env.NODE_ENV === 'production';
    }
  }
  return process.env.NODE_ENV === 'production';
}

/** Production HTTPS: `__Host-` prefix (Secure + Path=/ + no Domain) — SOPET-L-05. */
export function shouldUseHostCookiePrefix(request?: Request): boolean {
  return isSecureRequest(request) && process.env.NODE_ENV === 'production';
}

export function authCookieName(base: string, request?: Request): string {
  return shouldUseHostCookiePrefix(request) ? `__Host-${base}` : base;
}

function jwtCookieOptions(maxAge: number, request?: Request) {
  return {
    httpOnly: true as const,
    secure: isSecureRequest(request),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

function companionCookieOptions(request?: Request) {
  return {
    httpOnly: false as const,
    secure: isSecureRequest(request),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: REFRESH_MAX_AGE_SECONDS,
  };
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  request?: Request,
): void {
  const accessName = authCookieName(ACCESS_TOKEN_COOKIE, request);
  const refreshName = authCookieName(REFRESH_TOKEN_COOKIE, request);
  const companionName = authCookieName(AUTH_COMPANION_COOKIE, request);

  response.cookies.set(accessName, accessToken, jwtCookieOptions(ACCESS_MAX_AGE_SECONDS, request));
  response.cookies.set(
    refreshName,
    refreshToken,
    jwtCookieOptions(REFRESH_MAX_AGE_SECONDS, request),
  );
  response.cookies.set(companionName, '1', companionCookieOptions(request));

  // Clear legacy non-prefixed names when migrating to __Host-.
  if (shouldUseHostCookiePrefix(request)) {
    const clearLegacy = {
      httpOnly: true as const,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };
    response.cookies.set(ACCESS_TOKEN_COOKIE, '', clearLegacy);
    response.cookies.set(REFRESH_TOKEN_COOKIE, '', clearLegacy);
    response.cookies.set(AUTH_COMPANION_COOKIE, '', { ...clearLegacy, httpOnly: false });
  }
}

export function clearAuthCookies(response: NextResponse, request?: Request): void {
  const secure = isSecureRequest(request);
  const clearOpts = {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
  const names = [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    authCookieName(ACCESS_TOKEN_COOKIE, request),
    authCookieName(REFRESH_TOKEN_COOKIE, request),
  ];
  for (const name of new Set(names)) {
    response.cookies.set(name, '', clearOpts);
  }
  for (const name of new Set([
    AUTH_COMPANION_COOKIE,
    authCookieName(AUTH_COMPANION_COOKIE, request),
  ])) {
    response.cookies.set(name, '', {
      httpOnly: false,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}

async function readCookie(baseName: string, request?: Request): Promise<string | undefined> {
  const jar = await cookies();
  const hostName = authCookieName(baseName, request);
  return jar.get(hostName)?.value ?? jar.get(baseName)?.value;
}

export async function getAccessTokenFromRequest(request?: Request): Promise<string | undefined> {
  return readCookie(ACCESS_TOKEN_COOKIE, request);
}

export async function getRefreshTokenFromRequest(request?: Request): Promise<string | undefined> {
  return readCookie(REFRESH_TOKEN_COOKIE, request);
}

export async function isAuthenticatedFromCookies(request?: Request): Promise<boolean> {
  const access = await getAccessTokenFromRequest(request);
  return Boolean(access);
}
