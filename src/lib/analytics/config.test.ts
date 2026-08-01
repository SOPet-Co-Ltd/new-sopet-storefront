import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAnalyticsConfig,
  isAnalyticsKillSwitchOff,
  isValidGa4MeasurementId,
  isValidGtmId,
} from './config';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('isValidGtmId', () => {
  it('accepts standard GTM container IDs', () => {
    expect(isValidGtmId('GTM-ABC123')).toBe(true);
    expect(isValidGtmId('gtm-xyz9')).toBe(true);
  });

  it('rejects empty or malformed values', () => {
    expect(isValidGtmId('')).toBe(false);
    expect(isValidGtmId('G-ABC123')).toBe(false);
    expect(isValidGtmId('GTM-')).toBe(false);
    expect(isValidGtmId(null)).toBe(false);
    expect(isValidGtmId(undefined)).toBe(false);
  });
});

describe('isValidGa4MeasurementId', () => {
  it('accepts standard GA4 measurement IDs', () => {
    expect(isValidGa4MeasurementId('G-ABC123')).toBe(true);
    expect(isValidGa4MeasurementId('g-xyz9')).toBe(true);
  });

  it('rejects empty or malformed values', () => {
    expect(isValidGa4MeasurementId('')).toBe(false);
    expect(isValidGa4MeasurementId('GTM-ABC123')).toBe(false);
    expect(isValidGa4MeasurementId('G-')).toBe(false);
    expect(isValidGa4MeasurementId(null)).toBe(false);
  });
});

describe('getAnalyticsConfig', () => {
  it('disables analytics when no IDs are set', () => {
    const config = getAnalyticsConfig({
      ...process.env,
      NEXT_PUBLIC_GTM_ID: undefined,
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: undefined,
      NEXT_PUBLIC_ANALYTICS_ENABLED: undefined,
    });

    expect(config).toEqual({
      enabled: false,
      gtmId: null,
      ga4MeasurementId: null,
    });
  });

  it('enables analytics when a valid GTM ID is set', () => {
    const config = getAnalyticsConfig({
      ...process.env,
      NEXT_PUBLIC_GTM_ID: 'GTM-TEST01',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: undefined,
      NEXT_PUBLIC_ANALYTICS_ENABLED: undefined,
    });

    expect(config.enabled).toBe(true);
    expect(config.gtmId).toBe('GTM-TEST01');
    expect(config.ga4MeasurementId).toBeNull();
  });

  it('enables dual GTM + GA4 when both IDs are valid', () => {
    const config = getAnalyticsConfig({
      ...process.env,
      NEXT_PUBLIC_GTM_ID: 'GTM-TEST01',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST01',
    });

    expect(config).toEqual({
      enabled: true,
      gtmId: 'GTM-TEST01',
      ga4MeasurementId: 'G-TEST01',
    });
  });

  it('ignores invalid IDs', () => {
    const config = getAnalyticsConfig({
      ...process.env,
      NEXT_PUBLIC_GTM_ID: 'not-a-gtm-id',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'not-a-ga4-id',
    });

    expect(config.enabled).toBe(false);
    expect(config.gtmId).toBeNull();
    expect(config.ga4MeasurementId).toBeNull();
  });

  it('respects the kill-switch even when IDs are present', () => {
    const config = getAnalyticsConfig({
      ...process.env,
      NEXT_PUBLIC_GTM_ID: 'GTM-TEST01',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST01',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
    });

    expect(config.enabled).toBe(false);
    expect(config.gtmId).toBe('GTM-TEST01');
    expect(config.ga4MeasurementId).toBe('G-TEST01');
  });
});

describe('isAnalyticsKillSwitchOff', () => {
  it('is on (allows analytics) by default', () => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
    expect(isAnalyticsKillSwitchOff()).toBe(true);
  });

  it('is off when explicitly set to false', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'false');
    expect(isAnalyticsKillSwitchOff()).toBe(false);
  });
});
