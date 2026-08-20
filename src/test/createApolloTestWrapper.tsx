import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { Suspense, type ReactNode } from 'react';
import { makeApolloClient } from '@/lib/graphql/client';
import { SessionProvider } from '@/lib/providers/SessionProvider';

export function createApolloTestWrapper() {
  return function ApolloTestWrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloNextAppProvider makeClient={makeApolloClient}>
        <SessionProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </SessionProvider>
      </ApolloNextAppProvider>
    );
  };
}
