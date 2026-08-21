import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SESSION_ID_COOKIE,
  UUID_V4_REGEX,
  ensureSessionId,
  getSessionId,
  hydrateSessionId,
  resetSessionIdForTests,
  rotateSessionId,
} from './session';

const EXISTING_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

describe('getSessionId', () => {
  beforeEach(() => {
    resetSessionIdForTests();
  });

  afterEach(() => {
    resetSessionIdForTests();
  });

  it('returns null when memory session is absent', () => {
    expect(getSessionId()).toBeNull();
  });

  it('returns the in-memory UUID after ensureSessionId', () => {
    const sessionId = ensureSessionId();
    expect(getSessionId()).toBe(sessionId);
  });
});

describe('ensureSessionId', () => {
  beforeEach(() => {
    resetSessionIdForTests();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sessionId: EXISTING_SESSION_ID }),
      }),
    );
  });

  afterEach(() => {
    resetSessionIdForTests();
    vi.unstubAllGlobals();
  });

  it('creates a UUID v4 in memory on first call without writing document.cookie', () => {
    const setCookieSpy = vi.spyOn(document, 'cookie', 'set');
    const sessionId = ensureSessionId();

    expect(sessionId).toMatch(UUID_V4_REGEX);
    expect(document.cookie).not.toContain(`${SESSION_ID_COOKIE}=${sessionId}`);
    // May clear a legacy cookie (max-age=0) but must not persist the session id.
    for (const call of setCookieSpy.mock.calls) {
      const value = String(call[0] ?? '');
      expect(value).not.toMatch(new RegExp(`${SESSION_ID_COOKIE}=[0-9a-f-]{36};`, 'i'));
    }
  });

  it('returns the same id on repeated calls', () => {
    const first = ensureSessionId();
    const second = ensureSessionId();

    expect(second).toBe(first);
    expect(getSessionId()).toBe(first);
  });
});

describe('hydrateSessionId', () => {
  beforeEach(() => {
    resetSessionIdForTests();
  });

  afterEach(() => {
    resetSessionIdForTests();
    vi.unstubAllGlobals();
  });

  it('loads the session id from the BFF and caches it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sessionId: EXISTING_SESSION_ID }),
      }),
    );

    const sessionId = await hydrateSessionId();
    expect(sessionId).toBe(EXISTING_SESSION_ID);
    expect(getSessionId()).toBe(EXISTING_SESSION_ID);
  });
});

describe('rotateSessionId', () => {
  beforeEach(() => {
    resetSessionIdForTests();
  });

  afterEach(() => {
    resetSessionIdForTests();
    vi.unstubAllGlobals();
  });

  it('replaces the in-memory session from the BFF rotate response', async () => {
    const rotated = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sessionId: rotated }),
      }),
    );

    const sessionId = await rotateSessionId();
    expect(sessionId).toBe(rotated);
    expect(getSessionId()).toBe(rotated);
  });
});

describe('ensureSessionId SSR safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetSessionIdForTests();
  });

  it('throws when called without window in SSR context', () => {
    vi.stubGlobal('window', undefined);

    expect(() => ensureSessionId()).toThrow('ensureSessionId requires browser context');
  });
});

describe('getSessionId SSR safety', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetSessionIdForTests();
  });

  it('returns null when window is unavailable', () => {
    vi.stubGlobal('window', undefined);

    expect(getSessionId()).toBeNull();
  });
});
