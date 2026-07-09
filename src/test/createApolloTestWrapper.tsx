import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { Suspense, type ReactNode } from 'react';
import { makeApolloClient } from '@/lib/graphql/client';

export function createApolloTestWrapper() {
  return function ApolloTestWrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloNextAppProvider makeClient={makeApolloClient}>
        <Suspense fallback={null}>{children}</Suspense>
      </ApolloNextAppProvider>
    );
  };
}
