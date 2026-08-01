import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callGtag, ensureDataLayer, pushToDataLayer } from './dataLayer';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  // Fresh window.dataLayer / gtag per test
  delete window.dataLayer;
  delete window.gtag;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  delete window.dataLayer;
  delete window.gtag;
});

describe('ensureDataLayer', () => {
  it('creates an empty dataLayer array on window', () => {
    const layer = ensureDataLayer();
    expect(layer).toEqual([]);
    expect(window.dataLayer).toBe(layer);
  });

  it('reuses an existing dataLayer', () => {
    window.dataLayer = [{ event: 'existing' }];
    expect(ensureDataLayer()).toBe(window.dataLayer);
    expect(window.dataLayer).toHaveLength(1);
  });
});

describe('pushToDataLayer', () => {
  it('no-ops when analytics IDs are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', '');
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', '');

    expect(pushToDataLayer({ event: 'page_view' })).toBe(false);
    expect(window.dataLayer).toBeUndefined();
  });

  it('pushes when a valid GTM ID is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST01');

    expect(pushToDataLayer({ event: 'page_view', page_path: '/cart' })).toBe(true);
    expect(window.dataLayer).toEqual([{ event: 'page_view', page_path: '/cart' }]);
  });

  it('no-ops when the kill-switch is false', () => {
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'GTM-TEST01');
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'false');

    expect(pushToDataLayer({ event: 'page_view' })).toBe(false);
    expect(window.dataLayer).toBeUndefined();
  });
});

describe('callGtag', () => {
  it('returns false when gtag is not defined', () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST01');
    expect(callGtag('event', 'page_view')).toBe(false);
  });

  it('invokes window.gtag when available and analytics is enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST01');
    const gtag = vi.fn();
    window.gtag = gtag;

    expect(callGtag('event', 'page_view', { page_path: '/' })).toBe(true);
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', { page_path: '/' });
  });
});
