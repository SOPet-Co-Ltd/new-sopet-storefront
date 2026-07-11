import { HttpLink } from '@apollo/client';
import { split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import type { DocumentNode, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { from } from '@apollo/client/link';
import { createClient } from 'graphql-ws';
import { getGraphqlWsUrl, GRAPHQL_URL } from '@/lib/config';
import { createAuthLink, getAccessToken } from '@/lib/graphql/authLink';
import { typePolicies } from '@/lib/graphql/cachePolicies';

let browserApolloClient: ApolloClient | null = null;

function createWsLink(): GraphQLWsLink | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new GraphQLWsLink(
    createClient({
      url: getGraphqlWsUrl(),
      connectionParams: () => {
        const token = getAccessToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  );
}

function createApolloLink() {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  });

  const wsLink = createWsLink();
  if (!wsLink) {
    return from([createAuthLink(), httpLink]);
  }

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    from([createAuthLink(), httpLink]),
  );

  return splitLink;
}

export function makeApolloClient(): ApolloClient {
  return new ApolloClient({
    link: createApolloLink(),
    cache: new InMemoryCache({ typePolicies }),
  });
}

export function getApolloClient(): ApolloClient {
  if (typeof window === 'undefined') {
    return makeApolloClient();
  }

  if (!browserApolloClient) {
    browserApolloClient = makeApolloClient();
  }
  return browserApolloClient;
}

export async function executeQuery<TData, TVariables extends OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData>;
export async function executeQuery<TData>(
  document: DocumentNode,
  variables?: OperationVariables,
): Promise<TData>;
export async function executeQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(document: DocumentNode, variables?: TVariables): Promise<TData> {
  const result = await getApolloClient().query({
    query: document,
    ...(variables ? { variables } : {}),
    fetchPolicy: 'network-only',
  });

  if (!result.data) {
    throw new Error('GraphQL query returned no data.');
  }

  return result.data as TData;
}

export async function executeMutation<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(document: DocumentNode, variables?: TVariables): Promise<TData> {
  const result = await getApolloClient().mutate({
    mutation: document,
    ...(variables ? { variables } : {}),
  });

  if (!result.data) {
    throw new Error('GraphQL mutation returned no data.');
  }

  return result.data as TData;
}
