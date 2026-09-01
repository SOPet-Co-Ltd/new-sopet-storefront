import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { parseSessionIdCookie, SESSION_ID_COOKIE, SESSION_ID_MAX_AGE_SECONDS } from '@/lib/session';

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

/** Production HTTPS: `__Host-` prefix (Secure + Path=/ + no Domain). */
export function sessionCookieName(request?: Request): string {
  if (isSecureRequest(request) && process.env.NODE_ENV === 'production') {
    return `__Host-${SESSION_ID_COOKIE}`;
  }
  return SESSION_ID_COOKIE;
}

function sessionCookieOptions(request?: Request) {
  return {
    httpOnly: true as const,
    secure: isSecureRequest(request),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_ID_MAX_AGE_SECONDS,
  };
}

function createUuidV4(): string {
  return crypto.randomUUID();
}

export async function getSessionIdFromCookies(request?: Request): Promise<string | null> {
  const jar = await cookies();
  const hostName = sessionCookieName(request);
  const primary = parseSessionIdCookie(jar.get(hostName)?.value);
  if (primary) return primary;

  // Migrate legacy non-prefixed / previously JS-writable cookie name.
  if (hostName !== SESSION_ID_COOKIE) {
    return parseSessionIdCookie(jar.get(SESSION_ID_COOKIE)?.value);
  }
  return null;
}

export function setSessionIdCookie(
  response: NextResponse,
  sessionId: string,
  request?: Request,
): void {
  const name = sessionCookieName(request);
  response.cookies.set(name, sessionId, sessionCookieOptions(request));

  // Clear legacy client-writable cookie so it cannot shadow HttpOnly.
  if (name !== SESSION_ID_COOKIE) {
    response.cookies.set(SESSION_ID_COOKIE, '', {
      httpOnly: false,
      secure: isSecureRequest(request),
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  } else {
    // Ensure attributes upgrade even when name is unchanged.
    response.cookies.set(SESSION_ID_COOKIE, sessionId, sessionCookieOptions(request));
  }
}

export function clearSessionIdCookie(response: NextResponse, request?: Request): void {
  const secure = isSecureRequest(request);
  const clearOpts = {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
  response.cookies.set(sessionCookieName(request), '', clearOpts);
  response.cookies.set(SESSION_ID_COOKIE, '', { ...clearOpts, httpOnly: false });
}

/** Ensure a guest session cookie exists; return its id (create if missing). */
export async function ensureSessionIdCookie(
  response: NextResponse,
  request?: Request,
  preferred?: string | null,
): Promise<string> {
  const existing = await getSessionIdFromCookies(request);
  if (existing) {
    // Refresh attributes (HttpOnly / Secure / __Host-) on every ensure.
    setSessionIdCookie(response, existing, request);
    return existing;
  }

  const next = preferred && parseSessionIdCookie(preferred) ? preferred : createUuidV4();
  setSessionIdCookie(response, next, request);
  return next;
}

export async function rotateSessionIdCookie(
  response: NextResponse,
  request?: Request,
): Promise<string> {
  const next = createUuidV4();
  setSessionIdCookie(response, next, request);
  return next;
}

/**
 * Overwrite GraphQL `sessionId` variables from the HttpOnly cookie so the
 * browser never needs a readable guest-session cookie (SOPET-M-10).
 */
export function injectSessionIdIntoGraphqlBody(body: string, sessionId: string): string {
  try {
    const parsed = JSON.parse(body) as {
      variables?: Record<string, unknown>;
    };
    if (!parsed.variables || typeof parsed.variables !== 'object') {
      return body;
    }

    let changed = false;
    if ('sessionId' in parsed.variables) {
      parsed.variables.sessionId = sessionId;
      changed = true;
    }

    const input = parsed.variables.input;
    if (input && typeof input === 'object' && !Array.isArray(input) && 'sessionId' in input) {
      (input as Record<string, unknown>).sessionId = sessionId;
      changed = true;
    }

    return changed ? JSON.stringify(parsed) : body;
  } catch {
    return body;
  }
}
