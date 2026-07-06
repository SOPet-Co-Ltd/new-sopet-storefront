import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { computeCartItemCount, groupCartItemsByStore } from '@/lib/cart/cartUtils';
import { CartDocument } from '@/lib/graphql/generated/graphql';
import { CartProvider, useCart } from '@/lib/providers/CartProvider';
import { sampleCart } from '@/test/mocks/fixtures/cart';

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

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>();
  const sessionId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
  return {
    ...actual,
    ensureSessionId: vi.fn(() => sessionId),
    getSessionId: vi.fn(() => sessionId),
  };
});

vi.mock('@apollo/client/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client/react')>();
  return {
    ...actual,
    useQuery: (document: unknown, options?: { skip?: boolean }) => {
      if (document === CartDocument && !options?.skip) {
        return {
          data: { cart: sampleCart },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
        };
      }

      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      };
    },
    useMutation: () => [vi.fn(), { loading: false, error: undefined }],
  };
});

function CartProbe() {
  const { itemCount, itemsByStore, loading } = useCart();

  return (
    <div
      data-testid="cart-probe"
      data-item-count={String(itemCount)}
      data-store-count={String(itemsByStore.length)}
      data-loading={String(loading)}
    />
  );
}

describe('useCart', () => {
  it('derives item count and store groups from cart items', () => {
    expect(computeCartItemCount(sampleCart.items)).toBe(sampleCart.items[0]?.quantity ?? 0);
    expect(groupCartItemsByStore(sampleCart.items)).toHaveLength(1);
  });

  it('loads cart items and derives item count from CartProvider context', () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );

    expect(screen.getByTestId('cart-probe')).toHaveAttribute(
      'data-item-count',
      String(sampleCart.items[0]?.quantity ?? 0),
    );
    expect(screen.getByTestId('cart-probe')).toHaveAttribute('data-store-count', '1');
    expect(screen.getByTestId('cart-probe')).toHaveAttribute('data-loading', 'false');
  });
});
