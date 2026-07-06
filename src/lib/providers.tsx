'use client';

import { ApolloProvider } from '@apollo/client/react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { GlobalLoadingStage } from '@/components/organisms/GlobalLoadingStage';
import { getApolloClient } from '@/lib/graphql/client';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { CartProvider } from '@/lib/providers/CartProvider';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';

const ROUTE_LOADING_DELAY_MS = 0;

function RouteLoadingPreview() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), ROUTE_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) {
    return null;
  }

  return <GlobalLoadingStage />;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CartProvider>
          <CheckoutProvider>
            {children}
            <RouteLoadingPreview />
            <Toaster position="top-right" />
          </CheckoutProvider>
        </CartProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
