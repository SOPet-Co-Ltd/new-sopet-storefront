import { getAnalyticsConfig } from './config';
import { hasAnalyticsConsent } from '@/lib/consent/cookie-consent';

export type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Ensures `window.dataLayer` exists. No-op on the server. */
export function ensureDataLayer(): DataLayerObject[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

/**
 * Pushes a payload to `window.dataLayer` when analytics is enabled and consent is granted.
 */
export function pushToDataLayer(payload: DataLayerObject): boolean {
  const { enabled } = getAnalyticsConfig();
  if (!enabled || !hasAnalyticsConsent()) {
    return false;
  }

  const dataLayer = ensureDataLayer();
  if (!dataLayer) {
    return false;
  }

  dataLayer.push(payload);
  return true;
}

/**
 * Calls `window.gtag` when the direct GA4 bootstrap has defined it.
 * Returns false when analytics is disabled, consent is missing, or gtag is unavailable.
 */
export function callGtag(...args: unknown[]): boolean {
  const { enabled } = getAnalyticsConfig();
  if (
    !enabled ||
    !hasAnalyticsConsent() ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return false;
  }

  window.gtag(...args);
  return true;
}
