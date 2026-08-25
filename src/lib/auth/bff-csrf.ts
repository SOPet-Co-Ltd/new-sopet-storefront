/**
 * Same-origin CSRF check for BFF state-changing routes.
 * Allows missing Origin on same-site navigations that only send Referer,
 * and allows non-browser clients with neither header only in development.
 */

function addOrigin(origins: Set<string>, raw: string | undefined): void {
  const trimmed = raw?.trim();
  if (!trimmed) return;
  try {
    origins.add(new URL(trimmed).origin);
  } catch {
    // ignore invalid env
  }
}

function requestOrigin(request: Request): string | null {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

function defaultAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // SOPET-M-11: seed localhost only outside production so a deployed
  // production host does not accept Origin: http://localhost:3000.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('https://localhost:3000');
  }

  addOrigin(origins, process.env.NEXT_PUBLIC_STOREFRONT_URL);
  addOrigin(origins, process.env.NEXT_PUBLIC_BASE_URL);

  for (const entry of process.env.BFF_CSRF_ORIGINS?.split(',') ?? []) {
    addOrigin(origins, entry);
  }

  return [...origins];
}

function originAllowed(candidate: string, request: Request): boolean {
  if (getAllowedOrigins().includes(candidate)) {
    return true;
  }
  // True same-origin: browser Origin matches the URL this BFF received.
  // Lets `next start` on localhost work when NODE_ENV=production without
  // putting localhost on the production site's allow-list (SOPET-M-11).
  const self = requestOrigin(request);
  return self !== null && candidate === self;
}

export function getAllowedOrigins(): string[] {
  return defaultAllowedOrigins();
}

export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (origin) {
    if (!originAllowed(origin, request)) {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
    return null;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!originAllowed(refererOrigin, request)) {
        return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
      }
      return null;
    } catch {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
  }

  // Same-origin fetch from the app often includes Origin; if both are absent
  // (e.g. server-to-server tests), allow only outside production.
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
  }

  return null;
}
