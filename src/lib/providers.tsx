'use client';

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { LoadingLottieWarmupProvider } from '@/components/organisms/GlobalLoadingStage';
import { makeApolloClient } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CartProvider } from '@/lib/providers/CartProvider';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LoadingLottieWarmupProvider>
      <ApolloNextAppProvider makeClient={makeApolloClient}>
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              {children}
              <Toaster position="top-right" />
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </ApolloNextAppProvider>
    </LoadingLottieWarmupProvider>
  );
}
