import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { AddToCartDocument, CartDocument } from '@/lib/graphql/generated/graphql';
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
    hydrateSessionId: vi.fn(async () => sessionId),
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const variantId = 'variant-001';
const addToCartMutation = vi.fn().mockResolvedValue({ data: { addToCart: sampleCart } });

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
      if (document === AddToCartDocument) {
        return [addToCartMutation, { loading: false, error: undefined }];
      }
      return [vi.fn().mockResolvedValue({}), { loading: false, error: undefined }];
    },
  };
});

function CartAddItemProbe() {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => void addItem(variantId, 2)}>
      add-item
    </button>
  );
}

describe('CartProvider addItem', () => {
  it('shows a success toast when add to cart succeeds (SF-CART-029)', async () => {
    addToCartMutation.mockClear();
    vi.mocked(toast.success).mockClear();

    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartAddItemProbe />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'add-item' }));

    await waitFor(() => {
      expect(addToCartMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            variantId,
            quantity: 2,
            sessionId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
          },
        },
      });
    });

    expect(toast.success).toHaveBeenCalledWith('เพิ่มสินค้าลงตะกร้าแล้ว');
  });
});
