'use client';

import { ApolloProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { getApolloClient } from '@/lib/graphql/client';

export function AppProviders({ children }: { children: ReactNode }) {
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
}
