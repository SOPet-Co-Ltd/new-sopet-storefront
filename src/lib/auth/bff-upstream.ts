import { buildGraphqlSsrBypassHeaders, getGraphqlSsrBypassSecret } from '@/lib/config';

const DEFAULT_UPSTREAM = 'http://localhost:3002/graphql';

const REQUEST_ID_HEADER = 'x-request-id';
const CLIENT_IP_HEADER = 'x-sopet-client-ip';
const VERCEL_FORWARDED_FOR_HEADER = 'x-vercel-forwarded-for';
const FORWARDED_FOR_HEADER = 'x-forwarded-for';
const REAL_IP_HEADER = 'x-real-ip';

export function getUpstreamGraphqlUrl(): string {
  return process.env.GRAPHQL_SSR_URL ?? DEFAULT_UPSTREAM;
}

function firstHop(value: string | null): string | null {
  const hop = value?.split(',')[0]?.trim() ?? '';
  return hop || null;
}

/**
 * Visitor IP as seen by Vercel — not the serverless egress IP (often iad1 / Virginia).
 */
export function getIncomingClientIp(incomingRequest: Request): string | null {
  return (
    firstHop(incomingRequest.headers.get(VERCEL_FORWARDED_FOR_HEADER)) ||
    firstHop(incomingRequest.headers.get(REAL_IP_HEADER)) ||
    firstHop(incomingRequest.headers.get(FORWARDED_FOR_HEADER))
  );
}

/** Forward client correlation headers so backend rate limits / audit see the visitor IP. */
export function buildUpstreamRequestHeaders(incomingRequest?: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!incomingRequest) {
    return headers;
  }

  const requestId = incomingRequest.headers.get(REQUEST_ID_HEADER)?.trim();
  headers[REQUEST_ID_HEADER] = requestId || crypto.randomUUID();

  const clientIp = getIncomingClientIp(incomingRequest);
  if (clientIp) {
    headers[CLIENT_IP_HEADER] = clientIp;
    headers[FORWARDED_FOR_HEADER] = clientIp;
  }

  return headers;
}

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

type GraphQLJson = {
  data?: unknown;
  errors?: Array<{ message?: string; extensions?: { code?: string } }>;
};

const REFRESH_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export async function forwardGraphql(
  body: string,
  accessToken?: string,
  incomingRequest?: Request,
): Promise<{ response: Response; json: GraphQLJson }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildGraphqlSsrBypassHeaders(getGraphqlSsrBypassSecret()),
    ...buildUpstreamRequestHeaders(incomingRequest),
  };
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(getUpstreamGraphqlUrl(), {
    method: 'POST',
    headers,
    body,
  });

  const raw = await response.text();
  try {
    const json = JSON.parse(raw) as GraphQLJson;
    return { response, json };
  } catch {
    // Cloudflare bot challenges return HTML; never let JSON.parse throw a 500.
    return {
      response,
      json: {
        errors: [
          {
            message: `Upstream GraphQL returned non-JSON (HTTP ${response.status}). Check Cloudflare WAF / GRAPHQL_SSR_BYPASS_SECRET.`,
            extensions: { code: 'UPSTREAM_NON_JSON' },
          },
        ],
      },
    };
  }
}

export async function refreshTokensUpstream(
  refreshToken: string,
  incomingRequest?: Request,
): Promise<AuthTokenPair | null> {
  const { response, json } = await forwardGraphql(
    JSON.stringify({
      query: REFRESH_MUTATION,
      variables: { input: { refreshToken } },
    }),
    undefined,
    incomingRequest,
  );

  const tokens = (json.data as { refreshToken?: AuthTokenPair } | undefined)?.refreshToken;
  if (!response.ok || json.errors?.length || !tokens?.accessToken || !tokens?.refreshToken) {
    return null;
  }

  return tokens;
}

function isTokenPair(value: unknown): value is AuthTokenPair {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.accessToken === 'string' && typeof record.refreshToken === 'string';
}

/** Find the first AuthTokens-shaped object in a GraphQL data tree. */
export function harvestAuthTokens(data: unknown): AuthTokenPair | null {
  if (!data) return null;
  if (isTokenPair(data)) return data;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = harvestAuthTokens(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (isTokenPair(record.tokens)) {
      return record.tokens;
    }
    if (isTokenPair(record.refreshToken)) {
      return record.refreshToken;
    }
    for (const value of Object.values(record)) {
      const found = harvestAuthTokens(value);
      if (found) return found;
    }
  }

  return null;
}

/** Redact JWT string fields so browsers never receive them. */
export function redactAuthTokens(data: unknown): unknown {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactAuthTokens(item));
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if ((key === 'accessToken' || key === 'refreshToken') && typeof value === 'string') {
        next[key] = null;
        continue;
      }
      if (key === 'tokens' && isTokenPair(value)) {
        next[key] = { accessToken: null, refreshToken: null };
        continue;
      }
      next[key] = redactAuthTokens(value);
    }
    return next;
  }

  return data;
}

export function isUnauthenticatedPayload(json: GraphQLJson, httpStatus: number): boolean {
  if (httpStatus === 401) return true;
  return Boolean(
    json.errors?.some((error) => {
      const code = error.extensions?.code;
      return code === 'UNAUTHENTICATED' || code === 'UNAUTHORIZED';
    }),
  );
}
