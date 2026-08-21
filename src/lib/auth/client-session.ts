import { AUTH_COMPANION_COOKIE } from '@/lib/config';

/** Client-readable companion flag set alongside HttpOnly JWTs (supports `__Host-` prefix). */
export function hasAuthCompanionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const entries = document.cookie.split('; ');
  return (
    entries.some((entry) => entry.startsWith(`${AUTH_COMPANION_COOKIE}=`)) ||
    entries.some((entry) => entry.startsWith(`__Host-${AUTH_COMPANION_COOKIE}=`))
  );
}

export async function fetchAuthSession(): Promise<{ authenticated: boolean }> {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    return { authenticated: false };
  }
  return (await response.json()) as { authenticated: boolean };
}

export async function logoutViaBff(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function refreshViaBff(): Promise<boolean> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return response.ok;
}
