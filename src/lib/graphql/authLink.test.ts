import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { execute, ApolloLink } from '@apollo/client/link';
import { Observable } from 'rxjs';
import { gql, type ApolloClient } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ServerError } from '@apollo/client/errors';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  buildAuthHeaders,
  clearTokens,
  createAuthLink,
  getAccessToken,
  notifyAuthFailure,
  setOnAuthFailure,
  setTokens,
} from './authLink';

const TEST_QUERY = gql`
  query TestMe {
    me {
      customer {
        id
      }
    }
  }
`;

const mockClient = {
  incrementalHandler: {
    isIncrementalResult: () => false,
    prepareRequest: (request: ApolloLink.Request) => request,
    extractErrors: () => undefined,
  },
} as unknown as ApolloClient;

function runLink(link: ApolloLink, query = TEST_QUERY) {
  return firstValueFrom(execute(link, { query }, { client: mockClient }));
}

function createTerminalLink(
  handler: (operation: ApolloLink.Operation) => ApolloLink.Result,
): ApolloLink {
  return new ApolloLink(
    (operation) =>
      new Observable<ApolloLink.Result>((observer) => {
        try {
          const result = handler(operation);
          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }),
  );
}

function createBearerOnlyLink(): SetContextLink {
  return new SetContextLink((prevContext) => ({
    headers: buildAuthHeaders((prevContext.headers as Record<string, string> | undefined) ?? {}),
  }));
}

describe('authLink bearer injection', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('adds Bearer header when access token is present', () => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 'test-jwt');
    expect(buildAuthHeaders()).toEqual({ authorization: 'Bearer test-jwt' });
  });

  it('omits Bearer header when access token is absent', () => {
    expect(buildAuthHeaders()).toEqual({});
    expect(buildAuthHeaders({ 'content-type': 'application/json' })).toEqual({
      'content-type': 'application/json',
    });
  });

  it('injects Authorization on outbound GraphQL operations', async () => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 'test-jwt');

    let capturedHeaders: Record<string, string> | undefined;
    const terminalLink = createTerminalLink((operation) => {
      capturedHeaders = operation.getContext().headers as Record<string, string>;
      return { data: { me: { customer: { id: '1' } } } };
    });

    const link = createBearerOnlyLink().concat(terminalLink);
    const result = await runLink(link);

    expect(capturedHeaders?.authorization).toBe('Bearer test-jwt');
    expect(result.data).toEqual({ me: { customer: { id: '1' } } });
  });

  it('does not inject Authorization for anonymous requests', async () => {
    let capturedHeaders: Record<string, string> | undefined;
    const terminalLink = createTerminalLink((operation) => {
      capturedHeaders = operation.getContext().headers as Record<string, string>;
      return { data: { me: { customer: null } } };
    });

    const link = createBearerOnlyLink().concat(terminalLink);
    await runLink(link);

    expect(capturedHeaders?.authorization).toBeUndefined();
  });
});

describe('authLink 401 refresh', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    sessionStorage.clear();
    setOnAuthFailure(() => {
      clearTokens();
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retries once after refreshing tokens on 401', async () => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 'expired-jwt');
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          refreshToken: {
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
          },
        },
      }),
    }) as typeof fetch;

    let attempt = 0;
    const terminalLink = createTerminalLink(() => {
      attempt += 1;
      if (attempt === 1) {
        throw new ServerError('Unauthorized', {
          response: new Response(null, { status: 401 }),
          bodyText: 'Unauthorized',
        });
      }
      return { data: { me: { customer: { id: '1' } } } };
    });

    const link = createAuthLink().concat(terminalLink);
    const result = await runLink(link);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe('new-access');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh');
    expect(attempt).toBe(2);
    expect(result.data).toEqual({ me: { customer: { id: '1' } } });
  });

  it('clears tokens and notifies auth failure when refresh fails', async () => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 'expired-jwt');
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'bad-refresh');

    const authFailure = vi.fn();
    setOnAuthFailure(authFailure);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ message: 'Invalid refresh token' }] }),
    }) as typeof fetch;

    const terminalLink = createTerminalLink(() => {
      throw new ServerError('Unauthorized', {
        response: new Response(null, { status: 401 }),
        bodyText: 'Unauthorized',
      });
    });

    const link = createAuthLink().concat(terminalLink);

    await expect(runLink(link)).rejects.toBeDefined();
    expect(getAccessToken()).toBeNull();
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(authFailure).toHaveBeenCalledTimes(1);
  });

  it('logs out after a single refresh retry still returns 401', async () => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 'expired-jwt');
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'valid-refresh');

    const authFailure = vi.fn();
    setOnAuthFailure(authFailure);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          refreshToken: {
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
          },
        },
      }),
    }) as typeof fetch;

    let attempt = 0;
    const terminalLink = createTerminalLink(() => {
      attempt += 1;
      throw new ServerError('Unauthorized', {
        response: new Response(null, { status: 401 }),
        bodyText: 'Unauthorized',
      });
    });

    const link = createAuthLink().concat(terminalLink);

    await expect(runLink(link)).rejects.toBeDefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(attempt).toBe(2);
    expect(authFailure).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });
});

describe('token storage helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setOnAuthFailure(() => {
      clearTokens();
    });
  });

  it('roundtrips tokens through sessionStorage keys', () => {
    setTokens('access-jwt', 'refresh-jwt');
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-jwt');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-jwt');
  });

  it('notifyAuthFailure clears stored tokens', () => {
    setTokens('access-jwt', 'refresh-jwt');
    notifyAuthFailure();
    expect(getAccessToken()).toBeNull();
  });
});
