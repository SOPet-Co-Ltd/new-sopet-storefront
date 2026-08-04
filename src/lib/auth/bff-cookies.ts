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
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    jwtCookieOptions(ACCESS_MAX_AGE_SECONDS, request),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    jwtCookieOptions(REFRESH_MAX_AGE_SECONDS, request),
  );
  response.cookies.set(AUTH_COMPANION_COOKIE, '1', companionCookieOptions(request));
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
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', clearOpts);
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', clearOpts);
  response.cookies.set(AUTH_COMPANION_COOKIE, '', {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAccessTokenFromRequest(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshTokenFromRequest(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function isAuthenticatedFromCookies(): Promise<boolean> {
  const access = await getAccessTokenFromRequest();
  return Boolean(access);
}
