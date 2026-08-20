export const SESSION_ID_COOKIE = 'sopet_session_id';
export const RECENT_SEARCHES_STORAGE_KEY = 'sopet_recent_searches';

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let clientSessionCache: string | null = null;
let clientSessionInitPromise: Promise<string> | null = null;

function isValidUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export function parseSessionIdCookie(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  return isValidUuidV4(value) ? value : null;
}

export function setClientSessionId(sessionId: string): void {
  if (isValidUuidV4(sessionId)) {
    clientSessionCache = sessionId;
  }
}

export function resetClientSessionCache(): void {
  clientSessionCache = null;
  clientSessionInitPromise = null;
}

export function getSessionId(): string | null {
  return clientSessionCache;
}

export async function bootstrapSessionId(): Promise<string> {
  if (clientSessionCache) {
    return clientSessionCache;
  }

  if (clientSessionInitPromise) {
    return clientSessionInitPromise;
  }

  clientSessionInitPromise = (async () => {
    const response = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to bootstrap guest session');
    }

    const body = (await response.json()) as { sessionId?: string };
    const sessionId = parseSessionIdCookie(body.sessionId);
    if (!sessionId) {
      throw new Error('Invalid session response');
    }

    clientSessionCache = sessionId;
    return sessionId;
  })();

  try {
    return await clientSessionInitPromise;
  } finally {
    clientSessionInitPromise = null;
  }
}

export function ensureSessionId(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('ensureSessionId requires browser context');
  }

  if (clientSessionCache) {
    return clientSessionCache;
  }

  throw new Error('Guest session is not initialized; call bootstrapSessionId() first');
}
