/**
 * Cookie / analytics consent (PDPA-oriented).
 * Essential session cookies are always allowed; GTM/GA4 wait for analytics accept.
 * Marketing is kept in storage for a future UI toggle (hidden for now; always persisted off).
 * Replace banner copy when legal provides final wording.
 */

export const CONSENT_STORAGE_KEY = 'sopet_cookie_consent';
export const CONSENT_PREFERENCES_OPEN_EVENT = 'sopet:cookie-preferences-open';
export const CONSENT_CHANGE_EVENT = 'sopet:cookie-consent';

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

/** Legacy summary used by older callers/tests. */
export type CookieConsentStatus = 'accepted' | 'rejected' | 'unset';

type StoredConsentV1 = {
  v: 1;
  analytics: boolean;
  marketing: boolean;
};

/** In-memory fallback when localStorage is unavailable (SSR tests, private mode). */
let memoryPreferences: CookieConsentPreferences | null = null;

function readStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage?.getItem(CONSENT_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage?.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

function parseStored(raw: string | null): CookieConsentPreferences | null {
  if (!raw) {
    return null;
  }
  if (raw === 'accepted') {
    return { analytics: true, marketing: false };
  }
  if (raw === 'rejected') {
    return { analytics: false, marketing: false };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsentV1>;
    if (
      parsed?.v === 1 &&
      typeof parsed.analytics === 'boolean' &&
      typeof parsed.marketing === 'boolean'
    ) {
      return { analytics: parsed.analytics, marketing: parsed.marketing };
    }
  } catch {
    // ignore malformed
  }
  return null;
}

function toStoredJson(preferences: CookieConsentPreferences): string {
  const payload: StoredConsentV1 = {
    v: 1,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
  };
  return JSON.stringify(payload);
}

function emitConsentChange(preferences: CookieConsentPreferences): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences }));
  }
}

/** Test helper — resets in-memory consent between cases. */
export function resetCookieConsentMemory(): void {
  memoryPreferences = null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.removeItem(CONSENT_STORAGE_KEY);
    } catch {}
  }
}

export function readConsentPreferences(): CookieConsentPreferences | null {
  const stored = parseStored(readStorage());
  if (stored) {
    return stored;
  }
  return memoryPreferences;
}

export function hasConsentDecision(): boolean {
  return readConsentPreferences() !== null;
}

export function writeConsentPreferences(preferences: CookieConsentPreferences): void {
  // Marketing UI is hidden until scripts ship — never persist marketing=true yet.
  const next: CookieConsentPreferences = {
    analytics: preferences.analytics,
    marketing: false,
  };
  memoryPreferences = next;
  writeStorage(toStoredJson(next));
  emitConsentChange(next);
}

export function acceptAllCookies(): void {
  writeConsentPreferences({ analytics: true, marketing: false });
}

/** Opens the preferences panel from footer / floating control. */
export function openCookiePreferences(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_PREFERENCES_OPEN_EVENT));
  }
}

/**
 * Legacy write — `accepted` = all optional on; `rejected` = essential only.
 */
export function writeCookieConsent(status: 'accepted' | 'rejected'): void {
  if (status === 'accepted') {
    acceptAllCookies();
    return;
  }
  writeConsentPreferences({ analytics: false, marketing: false });
}

/**
 * Legacy read — `accepted` when analytics is on; otherwise `rejected` / `unset`.
 */
export function readCookieConsent(): CookieConsentStatus {
  const preferences = readConsentPreferences();
  if (!preferences) {
    return 'unset';
  }
  return preferences.analytics ? 'accepted' : 'rejected';
}

export function hasAnalyticsConsent(): boolean {
  return readConsentPreferences()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readConsentPreferences()?.marketing === true;
}
