import { HttpLink } from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { GRAPHQL_URL } from '@/lib/config';
import { typePolicies } from '@/lib/graphql/cachePolicies';

function makeRscApolloClient(): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache({ typePolicies }),
    link: new HttpLink({
      uri: GRAPHQL_URL,
      credentials: 'include',
    }),
  });
}

export const { getClient, query, PreloadQuery } = registerApolloClient(makeRscApolloClient);
