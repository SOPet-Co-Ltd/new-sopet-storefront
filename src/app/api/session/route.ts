import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { parseSessionIdCookie, SESSION_ID_COOKIE } from '@/lib/session';

const COOKIE_MAX_AGE_SECONDS = 31_536_000;

function isSecureRequest(request: Request): boolean {
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

function createSessionId(): string {
  return randomUUID();
}

export async function GET(request: Request) {
  const jar = await cookies();
  const existing = parseSessionIdCookie(jar.get(SESSION_ID_COOKIE)?.value);
  const sessionId = existing ?? createSessionId();

  const response = NextResponse.json({ sessionId });
  response.cookies.set(SESSION_ID_COOKIE, sessionId, {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
