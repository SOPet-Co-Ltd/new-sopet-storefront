import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeCartItemCount,
  computeCartSubtotal,
  groupCartItemsByStore,
} from '@/lib/cart/cartUtils';
import { useCheckoutCartSelection } from '@/lib/hooks/useCheckoutCartSelection';
import { sampleCartItem } from '@/test/mocks/fixtures/cart';

const mockCartState = {
  selectedItems: [sampleCartItem],
  selectedItemsByStore: groupCartItemsByStore([sampleCartItem]),
  selectedItemCount: computeCartItemCount([sampleCartItem]),
  selectedSubtotal: computeCartSubtotal([sampleCartItem]),
  loading: false,
  error: undefined as Error | undefined,
  refetch: vi.fn(async () => undefined),
  pruneDeselectedIds: vi.fn(),
};

const mockCheckoutState = {
  isSubmitting: false,
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/checkout',
}));

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: () => mockCartState,
}));

vi.mock('@/lib/providers/CheckoutProvider', () => ({
  useCheckout: () => mockCheckoutState,
}));

describe('useCheckoutCartSelection', () => {
  beforeEach(() => {
    mockCartState.selectedItems = [sampleCartItem];
    mockCartState.selectedItemsByStore = groupCartItemsByStore([sampleCartItem]);
    mockCartState.selectedItemCount = computeCartItemCount([sampleCartItem]);
    mockCartState.selectedSubtotal = computeCartSubtotal([sampleCartItem]);
    mockCartState.loading = false;
    mockCartState.error = undefined;
    mockCheckoutState.isSubmitting = false;
  });

  it('keeps the pre-pay subtotal while submitting after the cart is emptied', () => {
    const { result, rerender } = renderHook(() => useCheckoutCartSelection());

    expect(result.current.selectedSubtotal).toBe(1780);
    expect(result.current.selectedItemCount).toBe(2);

    act(() => {
      mockCheckoutState.isSubmitting = true;
    });
    rerender();

    expect(result.current.selectedSubtotal).toBe(1780);
    expect(result.current.selectedItemCount).toBe(2);

    act(() => {
      mockCartState.selectedItems = [];
      mockCartState.selectedItemsByStore = [];
      mockCartState.selectedItemCount = 0;
      mockCartState.selectedSubtotal = 0;
    });
    rerender();

    expect(result.current.selectedSubtotal).toBe(1780);
    expect(result.current.selectedItemCount).toBe(2);
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('follows the live cart again after submit ends', () => {
    const { result, rerender } = renderHook(() => useCheckoutCartSelection());

    act(() => {
      mockCheckoutState.isSubmitting = true;
    });
    rerender();

    act(() => {
      mockCartState.selectedItems = [];
      mockCartState.selectedItemsByStore = [];
      mockCartState.selectedItemCount = 0;
      mockCartState.selectedSubtotal = 0;
    });
    rerender();

    expect(result.current.selectedSubtotal).toBe(1780);

    act(() => {
      mockCheckoutState.isSubmitting = false;
    });
    rerender();

    expect(result.current.selectedSubtotal).toBe(0);
    expect(result.current.selectedItemCount).toBe(0);
    expect(result.current.selectedItems).toHaveLength(0);
  });
});
