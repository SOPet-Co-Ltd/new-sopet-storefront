import { NextResponse } from 'next/server';
import { getAccessTokenFromRequest, isAuthenticatedFromCookies } from '@/lib/auth/bff-cookies';
import { assertSameOrigin } from '@/lib/auth/bff-csrf';

/**
 * Short-lived access to the HttpOnly JWT for graphql-ws connectionParams (SOPET-M-05).
 * Same-origin POST only; never log the token.
 */
export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const authenticated = await isAuthenticatedFromCookies();
  if (!authenticated) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }

  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }

  return NextResponse.json({ accessToken });
}
