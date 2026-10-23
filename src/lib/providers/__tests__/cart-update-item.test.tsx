import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CartDocument,
  RemoveCartItemDocument,
  UpdateCartItemDocument,
} from '@/lib/graphql/generated/graphql';
import { CartProvider, useCart } from '@/lib/providers/CartProvider';
import { sampleCart, sampleCartItem } from '@/test/mocks/fixtures/cart';

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
    hydrateSessionId: vi.fn(async () => sessionId),
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const updateCartItemMutation = vi.fn().mockResolvedValue({ data: { updateCartItem: sampleCart } });
const removeCartItemMutation = vi.fn().mockResolvedValue({ data: { removeCartItem: sampleCart } });

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
    useMutation: (document: unknown) => {
      if (document === UpdateCartItemDocument) {
        return [updateCartItemMutation, { loading: false, error: undefined }];
      }
      if (document === RemoveCartItemDocument) {
        return [removeCartItemMutation, { loading: false, error: undefined }];
      }
      return [vi.fn().mockResolvedValue({}), { loading: false, error: undefined }];
    },
  };
});

function CartActionsProbe() {
  const { updateItem } = useCart();
  return (
    <button type="button" onClick={() => void updateItem(sampleCartItem.id, 0)}>
      decrement-to-zero
    </button>
  );
}

function CartRapidUpdateProbe() {
  const { updateItem } = useCart();
  return (
    <button
      type="button"
      onClick={() => {
        void updateItem(sampleCartItem.id, 2);
        void updateItem(sampleCartItem.id, 3);
        void updateItem(sampleCartItem.id, 5);
      }}
    >
      rapid-update
    </button>
  );
}

describe('CartProvider updateItem', () => {
  it('removes the cart line when quantity would become zero', async () => {
    updateCartItemMutation.mockClear();
    removeCartItemMutation.mockClear();

    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartActionsProbe />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'decrement-to-zero' }));

    await waitFor(() => {
      expect(removeCartItemMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            itemId: sampleCartItem.id,
            sessionId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
          },
        },
      });
    });
    expect(updateCartItemMutation).not.toHaveBeenCalled();
  });

  it('coalesces rapid updateItem calls to the latest quantity (SF-CART-020)', async () => {
    updateCartItemMutation.mockClear();
    removeCartItemMutation.mockClear();
    updateCartItemMutation.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: { updateCartItem: sampleCart } }), 30);
        }),
    );

    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartRapidUpdateProbe />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'rapid-update' }));

    await waitFor(() => {
      expect(updateCartItemMutation).toHaveBeenCalled();
    });

    await waitFor(() => {
      const quantities = updateCartItemMutation.mock.calls.map(
        (call) =>
          (call[0] as { variables: { input: { quantity: number } } }).variables.input.quantity,
      );
      expect(quantities[quantities.length - 1]).toBe(5);
    });
  });
});
