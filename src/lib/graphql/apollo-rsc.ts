import { HttpLink } from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { headers as nextHeaders } from 'next/headers';
import { buildGraphqlSsrBypassHeaders, GRAPHQL_URL } from '@/lib/config';
import { typePolicies } from '@/lib/graphql/cachePolicies';
import { fragmentRegistry } from '@/lib/graphql/fragmentRegistry';

const CLIENT_IP_HEADER = 'x-sopet-client-ip';
const VERCEL_FORWARDED_FOR_HEADER = 'x-vercel-forwarded-for';
const FORWARDED_FOR_HEADER = 'x-forwarded-for';
const REAL_IP_HEADER = 'x-real-ip';
const REQUEST_ID_HEADER = 'x-request-id';

function firstHop(value: string | null): string | null {
  const hop = value?.split(',')[0]?.trim() ?? '';
  return hop || null;
}

function buildRscUpstreamHeaders(headerStore: Headers): Record<string, string> {
  const out: Record<string, string> = {};

  const requestId = headerStore.get(REQUEST_ID_HEADER)?.trim();
  out[REQUEST_ID_HEADER] = requestId || crypto.randomUUID();

  const clientIp =
    firstHop(headerStore.get(VERCEL_FORWARDED_FOR_HEADER)) ||
    firstHop(headerStore.get(REAL_IP_HEADER)) ||
    firstHop(headerStore.get(FORWARDED_FOR_HEADER));
  if (clientIp) {
    out[CLIENT_IP_HEADER] = clientIp;
    out[FORWARDED_FOR_HEADER] = clientIp;
  }

  return out;
}

function makeRscApolloClient(): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache({ typePolicies, fragments: fragmentRegistry }),
    link: new HttpLink({
      uri: GRAPHQL_URL,
      credentials: 'include',
      headers: buildGraphqlSsrBypassHeaders(),
      fetch: async (uri, options) => {
        let extra: Record<string, string> = {};
        try {
          extra = buildRscUpstreamHeaders(await nextHeaders());
        } catch {
          extra = {};
        }
        const headers = new Headers(options?.headers);
        for (const [key, value] of Object.entries(extra)) {
          headers.set(key, value);
        }
        return fetch(uri, { ...options, headers });
      },
    }),
  });
}

export const { getClient, query, PreloadQuery } = registerApolloClient(makeRscApolloClient);
