import { Observable } from 'rxjs';
import { from, type ApolloLink } from '@apollo/client/link';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError, ServerParseError } from '@apollo/client/errors';
import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import { hasAuthCompanionCookie, logoutViaBff, refreshViaBff } from '@/lib/auth/client-session';

/** @deprecated Cookie name alias — JWTs are HttpOnly via BFF; do not read from JS. */
export const ACCESS_TOKEN_KEY = 'sopet_access_token';
/** @deprecated Cookie name alias — JWTs are HttpOnly via BFF; do not read from JS. */
export const REFRESH_TOKEN_KEY = 'sopet_refresh_token';

const AUTH_RETRY_FLAG = 'authRetried';

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler = () => {
  void clearTokens();
};

let refreshPromise: Promise<boolean> | null = null;

/** Client cannot read HttpOnly JWTs; use the companion flag instead. */
export function getAccessToken(): string | null {
  return null;
}

export function getRefreshToken(): string | null {
  return null;
}

/** No-op — BFF `/graphql` proxy harvests tokens into HttpOnly cookies. */
export function setTokens(_access: string, _refresh: string): void {
  void _access;
  void _refresh;
}

function clearCompanionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COMPANION_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}

export async function clearTokens(): Promise<void> {
  clearCompanionCookie();
  try {
    await logoutViaBff();
  } catch {
    // Best-effort; companion already cleared.
  }
}

export function hasClientSession(): boolean {
  return hasAuthCompanionCookie();
}

export function setOnAuthFailure(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(): void {
  clearCompanionCookie();
  void logoutViaBff();
  if (typeof window !== 'undefined') {
    onAuthFailure();
  }
}

export function buildAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
  // Bearer is attached by the Next.js `/graphql` BFF from HttpOnly cookies.
  return headers;
}

function isUnauthorized(error: unknown): boolean {
  if (ServerError.is(error) || ServerParseError.is(error)) {
    return error.statusCode === 401;
  }
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code;
    return code === 'UNAUTHENTICATED' || code === 'UNAUTHORIZED';
  }
  return false;
}

async function runRefreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshViaBff().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function createRefreshErrorLink(): ErrorLink {
  return new ErrorLink(({ error, operation, forward }) => {
    if (!isUnauthorized(error)) {
      return;
    }

    const context = operation.getContext();
    if (context[AUTH_RETRY_FLAG]) {
      notifyAuthFailure();
      return new Observable((observer) => {
        observer.error(error);
      });
    }

    if (!hasClientSession()) {
      notifyAuthFailure();
      return new Observable((observer) => {
        observer.error(error);
      });
    }

    return new Observable((observer) => {
      runRefreshOnce()
        .then((ok) => {
          if (!ok) {
            notifyAuthFailure();
            observer.error(error);
            return;
          }
          operation.setContext((previousContext) => ({
            ...previousContext,
            [AUTH_RETRY_FLAG]: true,
          }));
          const subscription = forward(operation).subscribe({
            next: (result) => observer.next(result),
            error: (retryError) => {
              if (isUnauthorized(retryError)) {
                notifyAuthFailure();
              }
              observer.error(retryError);
            },
            complete: () => observer.complete(),
          });
          return () => subscription.unsubscribe();
        })
        .catch(() => {
          notifyAuthFailure();
          observer.error(error);
        });
    });
  });
}

export function createAuthLink(): ApolloLink {
  return from([createRefreshErrorLink()]);
}
