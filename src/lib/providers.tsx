'use client';

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { GlobalLoadingStage } from '@/components/organisms/GlobalLoadingStage';
import { makeApolloClient } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CartProvider } from '@/lib/providers/CartProvider';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';

const ROUTE_LOADING_DELAY_MS = 0;

function RouteLoadingPreviewInner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), ROUTE_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return <GlobalLoadingStage />;
}

function RouteLoadingPreview() {
  const pathname = usePathname();
  return <RouteLoadingPreviewInner key={pathname} />;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeApolloClient}>
      <AuthProvider>
        <CartProvider>
          <CheckoutProvider>
            {children}
            <RouteLoadingPreview />
            <Toaster position="top-right" />
          </CheckoutProvider>
        </CartProvider>
      </AuthProvider>
    </ApolloNextAppProvider>
  );
}
