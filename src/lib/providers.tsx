'use client';

import { ApolloProvider } from '@apollo/client/react';
import { useMemo, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { getApolloClient } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CheckoutProvider>
          {children}
          <Toaster position="top-right" />
        </CheckoutProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
