export const SESSION_ID_COOKIE = 'sopet_session_id';
export const RECENT_SEARCHES_STORAGE_KEY = 'sopet_recent_searches';
export const SESSION_ID_MAX_AGE_SECONDS = 31_536_000;

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** In-memory mirror of the HttpOnly BFF cookie (SOPET-M-10). Not written to document.cookie. */
let memorySessionId: string | null = null;
let hydratePromise: Promise<string> | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isValidUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

function createUuidV4(): string {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    throw new Error('crypto.randomUUID is not available');
  }

  return crypto.randomUUID();
}

export function parseSessionIdCookie(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  return isValidUuidV4(value) ? value : null;
}

/** Clear legacy JS-writable cookie so it cannot shadow the HttpOnly BFF cookie. */
function clearLegacyDocumentCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${SESSION_ID_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}

export function getSessionId(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return memorySessionId && isValidUuidV4(memorySessionId) ? memorySessionId : null;
}

function applySessionId(sessionId: string): string {
  memorySessionId = sessionId;
  clearLegacyDocumentCookie();
  return sessionId;
}

/**
 * Fetch / establish the HttpOnly guest session from the BFF.
 * Safe to call multiple times; concurrent callers share one request.
 */
export async function hydrateSessionId(): Promise<string> {
  if (!isBrowser()) {
    throw new Error('hydrateSessionId requires browser context');
  }

  if (memorySessionId && isValidUuidV4(memorySessionId)) {
    return memorySessionId;
  }

  if (!hydratePromise) {
    hydratePromise = fetch('/api/session', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to establish guest session');
        }
        const data = (await response.json()) as { sessionId?: string };
        const sessionId = parseSessionIdCookie(data.sessionId);
        if (!sessionId) {
          throw new Error('Invalid guest session from BFF');
        }
        return applySessionId(sessionId);
      })
      .catch((error) => {
        hydratePromise = null;
        throw error;
      });
  }

  return hydratePromise;
}

/**
 * Rotate guest session after OTP verify + cart merge (SOPET-M-10).
 * Issues a new HttpOnly cookie and updates the in-memory mirror.
 */
export async function rotateSessionId(): Promise<string> {
  if (!isBrowser()) {
    throw new Error('rotateSessionId requires browser context');
  }

  const response = await fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rotate' }),
  });

  if (!response.ok) {
    throw new Error('Failed to rotate guest session');
  }

  const data = (await response.json()) as { sessionId?: string };
  const sessionId = parseSessionIdCookie(data.sessionId);
  if (!sessionId) {
    throw new Error('Invalid rotated guest session');
  }

  hydratePromise = Promise.resolve(sessionId);
  return applySessionId(sessionId);
}

/**
 * Synchronous accessor for cart mutations after hydrate.
 * If memory is empty, bootstraps a UUID and kicks off BFF ensure (best-effort).
 */
export function ensureSessionId(): string {
  if (!isBrowser()) {
    throw new Error('ensureSessionId requires browser context');
  }

  const existing = getSessionId();
  if (existing) {
    return existing;
  }

  // Rare path: mutation before hydrate completes — local UUID + async BFF sync.
  const sessionId = createUuidV4();
  applySessionId(sessionId);
  void fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ensure', sessionId }),
  })
    .then(async (response) => {
      if (!response.ok) return;
      const data = (await response.json()) as { sessionId?: string };
      const confirmed = parseSessionIdCookie(data.sessionId);
      if (confirmed) {
        applySessionId(confirmed);
      }
    })
    .catch(() => {
      // Cookie will be established on the next GraphQL BFF hop.
    });

  return sessionId;
}

/** Test helper — reset module state between tests. */
export function resetSessionIdForTests(): void {
  memorySessionId = null;
  hydratePromise = null;
}

/** Test helper — seed the in-memory guest session without calling the BFF. */
export function seedSessionIdForTests(sessionId: string): void {
  if (!isValidUuidV4(sessionId)) {
    throw new Error('seedSessionIdForTests requires a UUID v4');
  }
  memorySessionId = sessionId;
  hydratePromise = Promise.resolve(sessionId);
}
