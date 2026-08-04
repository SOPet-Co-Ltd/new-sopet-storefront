import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { execute, ApolloLink } from '@apollo/client/link';
import { Observable } from 'rxjs';
import { gql, type ApolloClient } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import {
  buildAuthHeaders,
  clearTokens,
  createAuthLink,
  getAccessToken,
  hasClientSession,
  notifyAuthFailure,
  setOnAuthFailure,
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

function setCompanion(): void {
  document.cookie = `${AUTH_COMPANION_COOKIE}=1; path=/`;
}

function clearCompanion(): void {
  document.cookie = `${AUTH_COMPANION_COOKIE}=; max-age=0; path=/`;
}

describe('authLink bearer injection', () => {
  beforeEach(() => {
    clearCompanion();
  });

  it('does not inject Bearer (BFF attaches Authorization)', () => {
    setCompanion();
    expect(buildAuthHeaders()).toEqual({});
    expect(getAccessToken()).toBeNull();
  });

  it('omits Bearer header when anonymous', () => {
    expect(buildAuthHeaders({ 'content-type': 'application/json' })).toEqual({
      'content-type': 'application/json',
    });
  });
});

describe('authLink 401 refresh via BFF', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearCompanion();
    setOnAuthFailure(() => {
      clearCompanion();
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retries once after BFF refresh on 401', async () => {
    setCompanion();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
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

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/refresh',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(attempt).toBe(2);
    expect(result.data).toEqual({ me: { customer: { id: '1' } } });
  });

  it('notifies auth failure when BFF refresh fails', async () => {
    setCompanion();
    const authFailure = vi.fn();
    setOnAuthFailure(authFailure);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false }),
    }) as typeof fetch;

    const terminalLink = createTerminalLink(() => {
      throw new ServerError('Unauthorized', {
        response: new Response(null, { status: 401 }),
        bodyText: 'Unauthorized',
      });
    });

    const link = createAuthLink().concat(terminalLink);

    await expect(runLink(link)).rejects.toBeDefined();
    expect(authFailure).toHaveBeenCalled();
  });
});

describe('token storage helpers', () => {
  beforeEach(() => {
    clearCompanion();
    setOnAuthFailure(() => {
      clearCompanion();
    });
  });

  it('tracks session via companion cookie only', () => {
    expect(hasClientSession()).toBe(false);
    setCompanion();
    expect(hasClientSession()).toBe(true);
  });

  it('notifyAuthFailure clears companion cookie', async () => {
    setCompanion();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    notifyAuthFailure();
    expect(hasClientSession()).toBe(false);
    await clearTokens();
  });
});
