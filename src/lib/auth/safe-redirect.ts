/**
 * Post-login `?next=` / `?returnUrl=` allowlist: same-origin pathname only.
 * Rejects protocol-relative, backslash, credential, and encoded bypasses.
 */
const SAFE_PATHNAME = /^\/[a-zA-Z0-9._~/-]*$/;

const DEFAULT_ORIGIN = 'http://localhost';

function resolveOrigin(origin?: string): string {
  if (origin) {
    return origin;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_ORIGIN;
}

function hasDangerousChars(value: string): boolean {
  return value.includes('\\') || value.includes('@') || value.includes('//');
}

export function getSafeRedirect(value: string | null | undefined, origin?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || hasDangerousChars(trimmed)) {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return null;
  }

  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    hasDangerousChars(decoded) ||
    !SAFE_PATHNAME.test(decoded)
  ) {
    return null;
  }

  try {
    const base = new URL(resolveOrigin(origin));
    const parsed = new URL(decoded, base);

    if (parsed.origin !== base.origin) {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    // Pathname-only: no query or hash (avoids smuggling via ?/\#).
    if (parsed.search || parsed.hash) {
      return null;
    }
    if (!SAFE_PATHNAME.test(parsed.pathname) || parsed.pathname.includes('//')) {
      return null;
    }

    return parsed.pathname;
  } catch {
    return null;
  }
}

/** Prefer `next`, fall back to legacy `returnUrl`. */
export function getSafeRedirectFromSearchParams(
  searchParams: { get(name: string): string | null },
  origin?: string,
): string | null {
  return (
    getSafeRedirect(searchParams.get('next'), origin) ??
    getSafeRedirect(searchParams.get('returnUrl'), origin)
  );
}
