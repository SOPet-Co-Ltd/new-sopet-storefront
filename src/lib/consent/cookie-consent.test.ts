/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  acceptAllCookies,
  hasAnalyticsConsent,
  hasConsentDecision,
  hasMarketingConsent,
  readConsentPreferences,
  readCookieConsent,
  resetCookieConsentMemory,
  writeConsentPreferences,
  writeCookieConsent,
} from './cookie-consent';

function stubLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  });
  return store;
}

describe('cookie-consent', () => {
  beforeEach(() => {
    resetCookieConsentMemory();
    stubLocalStorage();
  });

  afterEach(() => {
    resetCookieConsentMemory();
  });

  it('returns unset when nothing stored', () => {
    expect(readCookieConsent()).toBe('unset');
    expect(readConsentPreferences()).toBeNull();
    expect(hasConsentDecision()).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
    expect(hasMarketingConsent()).toBe(false);
  });

  it('persists granular preferences as JSON v1', () => {
    writeConsentPreferences({ analytics: true, marketing: false });
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });
    expect(hasAnalyticsConsent()).toBe(true);
    expect(hasMarketingConsent()).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toEqual({
      v: 1,
      analytics: true,
      marketing: false,
    });
  });

  it('acceptAllCookies enables analytics only (marketing UI hidden)', () => {
    acceptAllCookies();
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });
    expect(hasAnalyticsConsent()).toBe(true);
    expect(hasMarketingConsent()).toBe(false);
  });

  it('migrates legacy accepted / rejected strings', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });

    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected');
    expect(readConsentPreferences()).toEqual({ analytics: false, marketing: false });
  });

  it('forces marketing off even when callers pass marketing true', () => {
    writeConsentPreferences({ analytics: true, marketing: true });
    expect(readConsentPreferences()).toEqual({ analytics: true, marketing: false });
  });

  it('keeps legacy writeCookieConsent helpers', () => {
    writeCookieConsent('accepted');
    expect(readCookieConsent()).toBe('accepted');
    expect(hasAnalyticsConsent()).toBe(true);

    writeCookieConsent('rejected');
    expect(readCookieConsent()).toBe('rejected');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('dispatches a consent event', () => {
    const handler = vi.fn();
    window.addEventListener('sopet:cookie-consent', handler);
    writeConsentPreferences({ analytics: true, marketing: false });
    expect(handler).toHaveBeenCalled();
    window.removeEventListener('sopet:cookie-consent', handler);
  });
});
