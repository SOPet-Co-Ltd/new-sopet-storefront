/**
 * Same-origin CSRF check for BFF state-changing routes.
 * Allows missing Origin on same-site navigations that only send Referer,
 * and allows non-browser clients with neither header only outside strict CSRF envs.
 */

function defaultAllowedOrigins(): string[] {
  const origins = new Set<string>(['http://localhost:3000', 'https://localhost:3000']);

  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_URL?.trim();
  if (fromEnv) {
    try {
      origins.add(new URL(fromEnv).origin);
    } catch {
      // ignore invalid env
    }
  }

  const csrfExtra = process.env.BFF_CSRF_ORIGINS?.split(',') ?? [];
  for (const entry of csrfExtra) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      origins.add(new URL(trimmed).origin);
    } catch {
      // ignore
    }
  }

  return [...origins];
}

function requiresOriginHeaders(): boolean {
  if (process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN === 'true') {
    return false;
  }

  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV ?? '').toLowerCase();
  if (appEnv === 'staging' || appEnv === 'uat' || appEnv === 'preview') {
    return true;
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return true;
  }

  return false;
}

export function getAllowedOrigins(): string[] {
  return defaultAllowedOrigins();
}

export function assertSameOrigin(request: Request): Response | null {
  const allowed = getAllowedOrigins();
  const origin = request.headers.get('origin');
  if (origin) {
    if (!allowed.includes(origin)) {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
    return null;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowed.includes(refererOrigin)) {
        return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
      }
      return null;
    } catch {
      return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
    }
  }

  // Same-origin fetch from the app often includes Origin; if both are absent
  // (e.g. server-to-server tests), allow only outside strict CSRF environments.
  if (requiresOriginHeaders()) {
    return Response.json({ error: 'CSRF_ORIGIN_REJECTED' }, { status: 403 });
  }

  return null;
}
