'use client';

import { Suspense, type ReactNode } from 'react';
import { AnalyticsPageViews } from './AnalyticsPageViews';

type AnalyticsProviderProps = {
  children?: ReactNode;
};

/**
 * Client boundary for SPA page_view tracking. Suspense is required for
 * `useSearchParams` under the App Router.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AnalyticsPageViews />
      </Suspense>
    </>
  );
}
