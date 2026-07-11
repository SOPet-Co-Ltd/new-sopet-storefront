const DEFAULT_SERVER_GRAPHQL_URL = 'http://localhost:3002/graphql';
const DEFAULT_SERVER_GRAPHQL_WS_URL = 'ws://localhost:3002/graphql';

/** Browser: same-origin proxy (/graphql). SSR: direct backend URL. */
export const GRAPHQL_URL =
  typeof window === 'undefined'
    ? (process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL)
    : (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql');

/** WebSocket endpoint for GraphQL subscriptions (browser connects directly to API). */
export function getGraphqlWsUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.GRAPHQL_WS_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_WS_URL;
  }

  if (process.env.NEXT_PUBLIC_GRAPHQL_WS_URL) {
    return process.env.NEXT_PUBLIC_GRAPHQL_WS_URL;
  }

  const backendOrigin = process.env.NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN ?? 'http://localhost:3002';
  const url = new URL(backendOrigin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/graphql';
  url.search = '';
  url.hash = '';
  return url.toString();
}
