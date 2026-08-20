import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MockedProvider } from '@apollo/client/testing/react';
import { MeDocument, VerifyCustomerOtpDocument } from '@/lib/graphql/generated/graphql';
import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import { getSessionId, resetClientSessionCache, setClientSessionId } from '@/lib/session';
import { AuthProvider, type AuthContextValue } from './AuthProvider';
import { useAuth } from '@/lib/hooks/useAuth';

const TEST_CUSTOMER = {
  id: 'cust-1',
  phone: '0812345678',
  email: 'test@example.com',
  fullName: 'สมชาย ใจดี',
};

function AuthProbe({ onContext }: { onContext: (context: AuthContextValue) => void }) {
  const context = useAuth();
  onContext(context);
  return (
    <div
      data-authenticated={String(context.isAuthenticated)}
      data-loading={String(context.isLoading)}
      data-customer-id={context.customer?.id ?? ''}
      data-pending-deletion={String(context.pendingDeletion)}
    />
  );
}

async function waitFor(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function renderAuthProbe(
  onContext: (context: AuthContextValue) => void,
  mocks: ComponentProps<typeof MockedProvider>['mocks'] = [],
): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <MockedProvider mocks={mocks}>
        <AuthProvider>
          <AuthProbe onContext={onContext} />
        </AuthProvider>
      </MockedProvider>,
    );
  });

  return { container, root };
}

describe('AuthProvider', () => {
  let roots: Root[] = [];

  beforeEach(() => {
    sessionStorage.clear();
    resetClientSessionCache();
    document.cookie = `${AUTH_COMPANION_COOKIE}=; max-age=0; path=/`;
    setClientSessionId('a1b2c3d4-e5f6-4789-a012-3456789abcde');
    global.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
  });

  afterEach(() => {
    for (const root of roots) {
      act(() => {
        root.unmount();
      });
    }
    roots = [];
    document.body.innerHTML = '';
    sessionStorage.clear();
    resetClientSessionCache();
    document.cookie = `${AUTH_COMPANION_COOKIE}=; max-age=0; path=/`;
  });

  it('skips me query when anonymous', async () => {
    let meRequested = false;

    let context: AuthContextValue | null = null;
    const { root } = renderAuthProbe(
      (value) => {
        context = value;
      },
      [
        {
          request: { query: MeDocument },
          result: () => {
            meRequested = true;
            return {
              data: {
                me: {
                  customer: TEST_CUSTOMER,
                },
              },
            };
          },
        },
      ],
    );
    roots.push(root);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(meRequested).toBe(false);
    expect(context).not.toBeNull();
    expect(context!.isAuthenticated).toBe(false);
    expect(context!.isLoading).toBe(false);
    expect(context!.customer).toBeNull();
  });

  it('sets isAuthenticated and persists tokens after verifyOtp success', async () => {
    let context: AuthContextValue | null = null;
    const { container, root } = renderAuthProbe(
      (value) => {
        context = value;
      },
      [
        {
          request: {
            query: VerifyCustomerOtpDocument,
            variables: {
              input: {
                phone: '0812345678',
                code: '123456',
                sessionId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
              },
            },
          },
          result: {
            data: {
              verifyCustomerOtp: {
                customer: TEST_CUSTOMER,
                pendingDeletion: false,
                reactivationToken: null,
                tokens: {
                  accessToken: 'access-jwt',
                  refreshToken: 'refresh-jwt',
                },
              },
            },
          },
        },
        {
          request: { query: MeDocument },
          result: {
            data: {
              me: {
                customer: TEST_CUSTOMER,
              },
            },
          },
        },
      ],
    );
    roots.push(root);

    await act(async () => {
      await context!.verifyOtp('0812345678', '123456');
    });

    await act(async () => {
      await waitFor(() => context!.isAuthenticated);
    });

    expect(context!.isAuthenticated).toBe(true);
    expect(
      container.querySelector('[data-authenticated]')?.getAttribute('data-authenticated'),
    ).toBe('true');

    await act(async () => {
      await waitFor(() => context!.customer?.id === TEST_CUSTOMER.id);
    });

    expect(context!.customer).toEqual(TEST_CUSTOMER);
  });

  it('clears auth tokens on logout while preserving sessionId cookie', async () => {
    document.cookie = `${AUTH_COMPANION_COOKIE}=1; path=/`;

    let context: AuthContextValue | null = null;
    const { container, root } = renderAuthProbe(
      (value) => {
        context = value;
      },
      [
        {
          request: { query: MeDocument },
          result: {
            data: {
              me: {
                customer: TEST_CUSTOMER,
              },
            },
          },
        },
      ],
    );
    roots.push(root);

    await act(async () => {
      await waitFor(() => context!.isAuthenticated);
    });

    await act(async () => {
      await context!.logout();
    });

    expect(document.cookie.includes(`${AUTH_COMPANION_COOKIE}=1`)).toBe(false);
    expect(context!.isAuthenticated).toBe(false);
    expect(context!.customer).toBeNull();
    expect(
      container.querySelector('[data-authenticated]')?.getAttribute('data-authenticated'),
    ).toBe('false');
    expect(getSessionId()).toBe('a1b2c3d4-e5f6-4789-a012-3456789abcde');
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    expect(() => {
      act(() => {
        root.render(<AuthProbe onContext={() => {}} />);
      });
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
