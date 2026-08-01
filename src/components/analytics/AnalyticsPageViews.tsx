'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getAnalyticsConfig, trackPageView } from '@/lib/analytics';

/**
 * Fires `page_view` on App Router client navigations (and initial mount).
 * Must be wrapped in `<Suspense>` because it reads `useSearchParams`.
 */
export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const { enabled } = getAnalyticsConfig();
    if (!enabled || !pathname) {
      return;
    }

    const search = searchParams?.toString();
    const page_path = search ? `${pathname}?${search}` : pathname;

    if (lastPathRef.current === page_path) {
      return;
    }
    lastPathRef.current = page_path;

    trackPageView({
      page_path,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [pathname, searchParams]);

  return null;
}
