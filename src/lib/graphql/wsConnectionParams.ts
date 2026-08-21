/**
 * Module-level WS connection credentials for graphql-ws (SOPET-M-05).
 * Guest pay token is set by usePayment; JWT is fetched lazily in connectionParams.
 */

let guestPayToken: string | undefined;

export function setWsGuestPayToken(token: string | undefined): void {
  guestPayToken = token?.trim() || undefined;
}

export function getWsGuestPayToken(): string | undefined {
  return guestPayToken;
}

export async function fetchWsAccessToken(): Promise<string | undefined> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const response = await fetch('/api/auth/ws-token', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as { accessToken?: string | null };
    return typeof data.accessToken === 'string' && data.accessToken.trim()
      ? data.accessToken.trim()
      : undefined;
  } catch {
    return undefined;
  }
}

export async function buildWsConnectionParams(): Promise<Record<string, string>> {
  const params: Record<string, string> = {};

  const token = getWsGuestPayToken();
  if (token) {
    params.guestPayToken = token;
  }

  const accessToken = await fetchWsAccessToken();
  if (accessToken) {
    params.Authorization = `Bearer ${accessToken}`;
  }

  return params;
}
