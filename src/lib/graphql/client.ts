import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { GRAPHQL_URL } from '@/lib/config';

let apolloClient: ApolloClient | null = null;

function createApolloClient(): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_URL,
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });
}

export function getApolloClient(): ApolloClient {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
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
