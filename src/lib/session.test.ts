import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UUID_V4_REGEX,
  bootstrapSessionId,
  ensureSessionId,
  getSessionId,
  parseSessionIdCookie,
  resetClientSessionCache,
  setClientSessionId,
} from './session';

const EXISTING_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

describe('parseSessionIdCookie', () => {
  it('returns null for invalid values', () => {
    expect(parseSessionIdCookie(null)).toBeNull();
    expect(parseSessionIdCookie('not-a-uuid')).toBeNull();
  });

  it('returns valid UUID v4 values', () => {
    expect(parseSessionIdCookie(EXISTING_SESSION_ID)).toBe(EXISTING_SESSION_ID);
  });
});

describe('client session cache', () => {
  beforeEach(() => {
    resetClientSessionCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getSessionId returns null until cache is populated', () => {
    expect(getSessionId()).toBeNull();
  });

  it('setClientSessionId stores a valid UUID in memory', () => {
    setClientSessionId(EXISTING_SESSION_ID);
    expect(getSessionId()).toBe(EXISTING_SESSION_ID);
  });

  it('ensureSessionId returns cached session id', () => {
    setClientSessionId(EXISTING_SESSION_ID);
    expect(ensureSessionId()).toBe(EXISTING_SESSION_ID);
  });

  it('ensureSessionId throws when cache is empty in browser context', () => {
    expect(() => ensureSessionId()).toThrow('Guest session is not initialized');
  });

  it('bootstrapSessionId fetches from /api/session and caches the id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessionId: EXISTING_SESSION_ID }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const sessionId = await bootstrapSessionId();

    expect(sessionId).toBe(EXISTING_SESSION_ID);
    expect(sessionId).toMatch(UUID_V4_REGEX);
    expect(fetchMock).toHaveBeenCalledWith('/api/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    expect(getSessionId()).toBe(EXISTING_SESSION_ID);
  });

  it('ensureSessionId throws when document is unavailable', () => {
    vi.stubGlobal('document', undefined);
    expect(() => ensureSessionId()).toThrow('ensureSessionId requires browser context');
  });
});

describe('getSessionId SSR safety', () => {
  it('returns null when cache is empty', () => {
    expect(getSessionId()).toBeNull();
  });
});
