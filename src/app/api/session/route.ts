import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/bff-csrf';
import { ensureSessionIdCookie, rotateSessionIdCookie } from '@/lib/auth/bff-session';
import { parseSessionIdCookie } from '@/lib/session';

function jsonWithCookies(body: { sessionId: string }, cookieSource: NextResponse): NextResponse {
  const response = NextResponse.json(body);
  for (const cookie of cookieSource.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  return response;
}

/** Ensure HttpOnly guest session and return its id (SOPET-M-10). */
export async function GET(request: Request) {
  const cookieHolder = NextResponse.json({});
  const sessionId = await ensureSessionIdCookie(cookieHolder, request);
  return jsonWithCookies({ sessionId }, cookieHolder);
}

/**
 * POST { action: 'ensure' | 'rotate', sessionId?: string }
 * Rotate after OTP verify + cart merge; ensure accepts an optional preferred UUID.
 */
export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  let action: 'ensure' | 'rotate' = 'ensure';
  let preferred: string | null = null;

  try {
    const body = (await request.json()) as { action?: string; sessionId?: string };
    if (body.action === 'rotate') {
      action = 'rotate';
    }
    preferred = parseSessionIdCookie(body.sessionId) ?? null;
  } catch {
    // Empty body → ensure
  }

  const cookieHolder = NextResponse.json({});
  const sessionId =
    action === 'rotate'
      ? await rotateSessionIdCookie(cookieHolder, request)
      : await ensureSessionIdCookie(cookieHolder, request, preferred);

  return jsonWithCookies({ sessionId }, cookieHolder);
}
