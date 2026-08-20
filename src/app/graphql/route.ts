import { NextResponse } from 'next/server';
import { assertSameOrigin, getAllowedOrigins } from '@/lib/auth/bff-csrf';
import {
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from '@/lib/auth/bff-cookies';
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

  const body = await request.text();
  let accessToken = await getAccessTokenFromRequest();
  let { response: upstream, json } = await forwardGraphql(body, accessToken, request);

  if (isUnauthenticatedPayload(json, upstream.status)) {
    const refreshToken = await getRefreshTokenFromRequest();
    if (refreshToken) {
      const tokens = await refreshTokensUpstream(refreshToken, request);
      if (tokens) {
        accessToken = tokens.accessToken;
        ({ response: upstream, json } = await forwardGraphql(body, accessToken, request));
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
        return retryResponse;
      }

      const failed = NextResponse.json(json, { status: upstream.status === 200 ? 200 : 401 });
      clearAuthCookies(failed, request);
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

  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || !getAllowedOrigins().includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
