import { Observable } from 'rxjs';
import { print } from 'graphql';
import { from, type ApolloLink } from '@apollo/client/link';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import {
  CombinedGraphQLErrors,
  ServerError,
  ServerParseError,
} from '@apollo/client/errors';
import { GRAPHQL_URL } from '@/lib/config';
import { RefreshTokenDocument } from '@/lib/graphql/generated/graphql';

export const ACCESS_TOKEN_KEY = 'sopet_access_token';
export const REFRESH_TOKEN_KEY = 'sopet_refresh_token';

const AUTH_RETRY_FLAG = 'authRetried';

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler = () => {
  clearTokens();
};

let refreshPromise: Promise<void> | null = null;

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setOnAuthFailure(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(): void {
  clearTokens();
  if (typeof window !== 'undefined') {
    onAuthFailure();
  }
}

export function buildAuthHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    authorization: `Bearer ${token}`,
  };
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

async function refreshAccessToken(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(RefreshTokenDocument),
      variables: { input: { refreshToken } },
    }),
  });

  const payload = (await response.json()) as {
    data?: {
      refreshToken?: { accessToken: string; refreshToken: string };
    };
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length || !payload.data?.refreshToken) {
    throw new Error(payload.errors?.[0]?.message ?? 'Token refresh failed.');
  }

  const { accessToken, refreshToken: newRefreshToken } = payload.data.refreshToken;
  setTokens(accessToken, newRefreshToken);
}

async function runRefreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
}

function createBearerContextLink(): SetContextLink {
  return new SetContextLink((prevContext) => ({
    headers: buildAuthHeaders(
      (prevContext.headers as Record<string, string> | undefined) ?? {},
    ),
  }));
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

    if (!getRefreshToken()) {
      notifyAuthFailure();
      return new Observable((observer) => {
        observer.error(error);
      });
    }

    return new Observable((observer) => {
      runRefreshOnce()
        .then(() => {
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
  return from([createBearerContextLink(), createRefreshErrorLink()]);
}
