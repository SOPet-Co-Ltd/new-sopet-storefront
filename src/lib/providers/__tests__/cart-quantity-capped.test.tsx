import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CartDocument } from '@/lib/graphql/generated/graphql';
import { CartProvider } from '@/lib/providers/CartProvider';
import { sampleCart, sampleCartItem } from '@/test/mocks/fixtures/cart';
import { toast } from 'sonner';

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
  toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() },
}));

vi.mock('@apollo/client/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client/react')>();
  return {
    ...actual,
    useQuery: (document: unknown, options?: { skip?: boolean }) => {
      if (document === CartDocument && !options?.skip) {
        return {
          data: {
            cart: {
              ...sampleCart,
              items: [
                {
                  ...sampleCartItem,
                  quantity: 2,
                  productVariant: sampleCartItem.productVariant
                    ? { ...sampleCartItem.productVariant, stockQuantity: 2 }
                    : null,
                },
              ],
              warnings: [
                {
                  __typename: 'CartWarningType' as const,
                  code: 'QUANTITY_CAPPED',
                  message: 'Quantity reduced to available stock (2)',
                  variantId: sampleCartItem.variantId,
                },
              ],
            },
          },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
        };
      }
      return { data: undefined, loading: false, error: undefined, refetch: vi.fn() };
    },
    useMutation: () => [vi.fn().mockResolvedValue({}), { loading: false, error: undefined }],
  };
});

describe('CartProvider quantity capped warning', () => {
  it('toasts when cart returns QUANTITY_CAPPED (SF-CART-035)', async () => {
    render(
      <CartProvider>
        <div />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(toast.message).toHaveBeenCalledWith('ปรับจำนวนสินค้าตามสต็อกที่มีแล้ว');
    });
  });
});
