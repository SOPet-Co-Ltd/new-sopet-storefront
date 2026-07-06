import { ApolloProvider } from '@apollo/client/react';
import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider, useCart } from '@/lib/providers/CartProvider';
import { getApolloClient } from '@/lib/graphql/client';
import { SESSION_ID_COOKIE } from '@/lib/session';
import { sampleCart } from '@/test/mocks/fixtures/cart';
import { server } from '@/test/mocks/server';

const TEST_SESSION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>();
  return {
    ...actual,
    ensureSessionId: vi.fn(() => TEST_SESSION_ID),
    getSessionId: vi.fn(() => TEST_SESSION_ID),
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

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      ApolloProvider,
      { client },
      createElement(CartProvider, null, children),
    );
  };
}

afterEach(async () => {
  document.cookie = `${SESSION_ID_COOKIE}=; max-age=0; path=/`;
  await getApolloClient().clearStore();
});

describe('useCart', () => {
  it('loads cart items and derives item count', async () => {
    document.cookie = `${SESSION_ID_COOKIE}=${TEST_SESSION_ID}; path=/`;

    server.use(
      graphql.query('Cart', () =>
        HttpResponse.json({
          data: { cart: sampleCart },
        }),
      ),
    );

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.itemCount).toBe(sampleCart.items[0]?.quantity ?? 0);
    });
    expect(result.current.itemsByStore).toHaveLength(1);
  });
});
