import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/bff-csrf';
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from '@/lib/auth/bff-cookies';
import { refreshTokensUpstream } from '@/lib/auth/bff-upstream';

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const refreshToken = await getRefreshTokenFromRequest();
  if (!refreshToken) {
    const response = NextResponse.json({ ok: false }, { status: 401 });
    clearAuthCookies(response, request);
    return response;
  }

  const tokens = await refreshTokensUpstream(refreshToken);
  if (!tokens) {
    const response = NextResponse.json({ ok: false }, { status: 401 });
    clearAuthCookies(response, request);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, tokens.accessToken, tokens.refreshToken, request);
  return response;
}
