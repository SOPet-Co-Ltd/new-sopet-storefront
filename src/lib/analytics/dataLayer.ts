import { getAnalyticsConfig } from './config';

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
 * Pushes a payload to `window.dataLayer` when analytics is enabled.
 * No-ops on the server, when IDs/kill-switch disable analytics, or when
 * `window` is unavailable.
 */
export function pushToDataLayer(payload: DataLayerObject): boolean {
  const { enabled } = getAnalyticsConfig();
  if (!enabled) {
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
 * Returns false when analytics is disabled or gtag is not yet available.
 */
export function callGtag(...args: unknown[]): boolean {
  const { enabled } = getAnalyticsConfig();
  if (!enabled || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  window.gtag(...args);
  return true;
}
