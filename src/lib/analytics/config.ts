const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export type AnalyticsConfig = {
  /** True when analytics may load/push (kill-switch + at least one valid ID). */
  enabled: boolean;
  gtmId: string | null;
  ga4MeasurementId: string | null;
};

function normalizeId(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Validates a Google Tag Manager container ID (`GTM-XXXX`). */
export function isValidGtmId(value: string | null | undefined): value is string {
  return typeof value === 'string' && GTM_ID_PATTERN.test(value.trim());
}

/** Validates a GA4 measurement ID (`G-XXXX`). */
export function isValidGa4MeasurementId(value: string | null | undefined): value is string {
  return typeof value === 'string' && GA4_ID_PATTERN.test(value.trim());
}

/**
 * Kill-switch: `NEXT_PUBLIC_ANALYTICS_ENABLED=false` disables all tags/pushes.
 * When unset or any other value, analytics is allowed if a valid ID is present.
 */
export function isAnalyticsKillSwitchOff(): boolean {
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED?.trim().toLowerCase();
  return flag !== 'false' && flag !== '0';
}

/**
 * Resolves public analytics env vars. Safe to call on server or client.
 * Invalid IDs are ignored (treated as unset).
 */
export function getAnalyticsConfig(env: NodeJS.ProcessEnv = process.env): AnalyticsConfig {
  const rawGtm = normalizeId(env.NEXT_PUBLIC_GTM_ID);
  const rawGa4 = normalizeId(env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);

  const gtmId = isValidGtmId(rawGtm) ? rawGtm.trim() : null;
  const ga4MeasurementId = isValidGa4MeasurementId(rawGa4) ? rawGa4.trim() : null;

  const killSwitchAllows = (() => {
    const flag = env.NEXT_PUBLIC_ANALYTICS_ENABLED?.trim().toLowerCase();
    return flag !== 'false' && flag !== '0';
  })();

  const hasIds = Boolean(gtmId || ga4MeasurementId);

  return {
    enabled: killSwitchAllows && hasIds,
    gtmId,
    ga4MeasurementId,
  };
}
