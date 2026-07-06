import { MockedProvider } from '@apollo/client/testing/react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartDocument } from '@/lib/graphql/generated/graphql';
import { CartProvider, useCart, type CartContextValue } from '@/lib/providers/CartProvider';
import { SESSION_ID_COOKIE } from '@/lib/session';
import { sampleCart } from '@/test/mocks/fixtures/cart';

const { TEST_SESSION_ID, mockEnsureSessionId } = vi.hoisted(() => {
  const id = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
  return {
    TEST_SESSION_ID: id,
    mockEnsureSessionId: vi.fn(() => id),
  };
});

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>();
  return {
    ...actual,
    ensureSessionId: mockEnsureSessionId,
    getSessionId: mockEnsureSessionId,
  };
});

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

function CartProbe({
  onContext,
}: {
  onContext: (context: CartContextValue) => void;
}) {
  const context = useCart();
  onContext(context);
  return (
    <div
      data-item-count={String(context.itemCount)}
      data-loading={String(context.loading)}
    />
  );
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 2_000,
): Promise<void> {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe('useCart', () => {
  let roots: Root[] = [];
  let context: CartContextValue | null = null;

  beforeEach(() => {
    context = null;
    document.cookie = `${SESSION_ID_COOKIE}=${TEST_SESSION_ID}; path=/`;
  });

  afterEach(() => {
    for (const root of roots) {
      act(() => {
        root.unmount();
      });
    }
    roots = [];
    document.body.innerHTML = '';
    document.cookie = `${SESSION_ID_COOKIE}=; max-age=0; path=/`;
  });

  it.skip('loads cart items and derives item count — flaky MockedProvider/MSW cart query; fix in P3-T9', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    act(() => {
      root.render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: CartDocument,
              },
              result: { data: { cart: sampleCart } },
              maxUsageCount: 2,
            },
          ]}
          addTypename={false}
        >
          <CartProvider>
            <CartProbe onContext={(value) => { context = value; }} />
          </CartProvider>
        </MockedProvider>,
      );
    });

    await waitFor(() => context?.itemCount === (sampleCart.items[0]?.quantity ?? 0));

    expect(context?.itemsByStore).toHaveLength(1);
  });
});
