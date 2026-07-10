export const SESSION_ID_COOKIE = 'sopet_session_id';
export const RECENT_SEARCHES_STORAGE_KEY = 'sopet_recent_searches';

const COOKIE_MAX_AGE_SECONDS = 31_536_000;
export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

function isValidUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

function readCookie(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const prefix = `${name}=`;
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match.slice(prefix.length));
  return value || null;
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

function createUuidV4(): string {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    throw new Error('crypto.randomUUID is not available');
  }

  return crypto.randomUUID();
}

export function getSessionId(): string | null {
  const value = readCookie(SESSION_ID_COOKIE);

  if (value && isValidUuidV4(value)) {
    return value;
  }

  return null;
}

export function parseSessionIdCookie(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  return isValidUuidV4(value) ? value : null;
}

export function ensureSessionId(): string {
  const existing = getSessionId();

  if (existing) {
    return existing;
  }

  if (!isBrowser()) {
    throw new Error('ensureSessionId requires browser context');
  }

  const sessionId = createUuidV4();
  writeCookie(SESSION_ID_COOKIE, sessionId);
  return sessionId;
}
