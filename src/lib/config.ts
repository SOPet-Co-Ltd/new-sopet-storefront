const DEFAULT_SERVER_GRAPHQL_URL = 'http://localhost:3002/graphql';

/** Browser: same-origin proxy (/graphql). SSR: direct backend URL. */
export const GRAPHQL_URL =
  typeof window === 'undefined'
    ? process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL
    : (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql');
