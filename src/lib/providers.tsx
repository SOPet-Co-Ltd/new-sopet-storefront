'use client';

import { ApolloProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { getApolloClient } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={getApolloClient()}>
      <AuthProvider>
        <CheckoutProvider>
          {children}
          <Toaster position="top-right" />
        </CheckoutProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
