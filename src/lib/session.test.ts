import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SESSION_ID_COOKIE,
  ensureSessionId,
  getSessionId,
} from './session';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXISTING_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

function clearSessionCookie(): void {
  document.cookie = `${SESSION_ID_COOKIE}=; max-age=0; path=/`;
}

describe('getSessionId', () => {
  beforeEach(() => {
    clearSessionCookie();
  });

  afterEach(() => {
    clearSessionCookie();
  });

  it('returns null when the session cookie is absent', () => {
    expect(getSessionId()).toBeNull();
  });

  it('returns the existing UUID when the cookie is already set', () => {
    document.cookie = `${SESSION_ID_COOKIE}=${EXISTING_SESSION_ID}; path=/`;

    expect(getSessionId()).toBe(EXISTING_SESSION_ID);
  });

  it('returns null when the cookie value is not a valid UUID v4', () => {
    document.cookie = `${SESSION_ID_COOKIE}=not-a-valid-uuid; path=/`;

    expect(getSessionId()).toBeNull();
  });
});

describe('ensureSessionId', () => {
  beforeEach(() => {
    clearSessionCookie();
  });

  afterEach(() => {
    clearSessionCookie();
    vi.unstubAllGlobals();
  });

  it('creates a UUID v4 cookie on first call', () => {
    const sessionId = ensureSessionId();

    expect(sessionId).toMatch(UUID_V4_REGEX);
    expect(document.cookie).toContain(`${SESSION_ID_COOKIE}=${sessionId}`);
  });

  it('returns the same id on repeated calls without overwriting the cookie', () => {
    const first = ensureSessionId();
    const second = ensureSessionId();

    expect(second).toBe(first);
    expect(getSessionId()).toBe(first);
  });

  it('returns the existing cookie value without generating a new UUID', () => {
    document.cookie = `${SESSION_ID_COOKIE}=${EXISTING_SESSION_ID}; path=/`;

    const sessionId = ensureSessionId();

    expect(sessionId).toBe(EXISTING_SESSION_ID);
    expect(document.cookie).toContain(`${SESSION_ID_COOKIE}=${EXISTING_SESSION_ID}`);
  });

  it('sets cookie attributes with 365-day max-age, path /, and SameSite=Lax', () => {
    const setCookieSpy = vi.spyOn(document, 'cookie', 'set');

    ensureSessionId();

    expect(setCookieSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(
          `^${SESSION_ID_COOKIE}=[0-9a-f-]{36}; max-age=31536000; path=/; SameSite=Lax$`,
          'i',
        ),
      ),
    );
  });

  it('roundtrips the persisted UUID through getSessionId', () => {
    const sessionId = ensureSessionId();

    expect(getSessionId()).toBe(sessionId);
  });
});

describe('ensureSessionId SSR safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when called without document in SSR context', () => {
    vi.stubGlobal('document', undefined);

    expect(() => ensureSessionId()).toThrow(
      'ensureSessionId requires browser context',
    );
  });
});

describe('getSessionId SSR safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when document is unavailable', () => {
    vi.stubGlobal('document', undefined);

    expect(getSessionId()).toBeNull();
  });
});
