import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/bff-csrf';
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from '@/lib/auth/bff-cookies';
import {
  ensureSessionIdCookie,
  injectSessionIdIntoGraphqlBody,
  setSessionIdCookie,
} from '@/lib/auth/bff-session';
import {
  forwardGraphql,
  harvestAuthTokens,
  isUnauthenticatedPayload,
  redactAuthTokens,
  refreshTokensUpstream,
} from '@/lib/auth/bff-upstream';

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const rawBody = await request.text();
  const sessionHolder = NextResponse.json({});
  const sessionId = await ensureSessionIdCookie(sessionHolder, request);
  const body = injectSessionIdIntoGraphqlBody(rawBody, sessionId);

  let accessToken = await getAccessTokenFromRequest();
  let { response: upstream, json } = await forwardGraphql(body, accessToken);

  if (isUnauthenticatedPayload(json, upstream.status)) {
    const refreshToken = await getRefreshTokenFromRequest();
    if (refreshToken) {
      const tokens = await refreshTokensUpstream(refreshToken);
      if (tokens) {
        accessToken = tokens.accessToken;
        ({ response: upstream, json } = await forwardGraphql(body, accessToken));
        const retryResponse = NextResponse.json(
          {
            ...json,
            data: json.data !== undefined ? redactAuthTokens(json.data) : json.data,
          },
          { status: upstream.status },
        );
        setAuthCookies(retryResponse, tokens.accessToken, tokens.refreshToken, request);
        const harvested = harvestAuthTokens(json.data);
        if (harvested) {
          setAuthCookies(retryResponse, harvested.accessToken, harvested.refreshToken, request);
        }
        setSessionIdCookie(retryResponse, sessionId, request);
        return retryResponse;
      }

      const failed = NextResponse.json(json, { status: upstream.status === 200 ? 200 : 401 });
      clearAuthCookies(failed, request);
      setSessionIdCookie(failed, sessionId, request);
      return failed;
    }
  }

  const harvested = harvestAuthTokens(json.data);
  const response = NextResponse.json(
    {
      ...json,
      data: json.data !== undefined ? redactAuthTokens(json.data) : json.data,
    },
    { status: upstream.status },
  );

  if (harvested) {
    setAuthCookies(response, harvested.accessToken, harvested.refreshToken, request);
  }

  setSessionIdCookie(response, sessionId, request);
  return response;
}

/**
 * Same-origin BFF: browsers do not need CORS for same-origin GraphQL POSTs.
 * Do not reflect Origin or advertise credentials (SOPET-H-06).
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
