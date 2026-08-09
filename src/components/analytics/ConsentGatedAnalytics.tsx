'use client';

import { useSyncExternalStore } from 'react';
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts';
import { hasAnalyticsConsent } from '@/lib/consent/cookie-consent';

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener('sopet:cookie-consent', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('sopet:cookie-consent', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

/**
 * Loads GTM/GA4 only after the shopper accepts analytics cookies.
 * Essential auth/session cookies are unaffected (HttpOnly BFF).
 */
export function ConsentGatedAnalytics() {
  const allowed = useSyncExternalStore(
    subscribeConsent,
    hasAnalyticsConsent,
    () => false,
  );

  if (!allowed) {
    return null;
  }

  return <AnalyticsScripts />;
}
