import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutAutoApplyController } from '@/components/sections/CheckoutSection/CheckoutAutoApplyController';
import {
  buildAutoApplyCartFingerprint,
  hasAutoApplyAttempted,
  markAutoApplyAttempted,
  resetAutoApplyOnceGateMemory,
} from '@/lib/checkout/autoApplyOnceGate';

const { runCheckoutAutoApply } = vi.hoisted(() => ({
  runCheckoutAutoApply: vi.fn(async () => ({
    settled: true as const,
    appliedPlatformCode: null,
    appliedStoreCodes: {},
  })),
}));

vi.mock('@/lib/checkout/runCheckoutAutoApply', () => ({
  runCheckoutAutoApply,
}));

vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: vi.fn() }),
  useQuery: () => ({
    data: {
      activePlatformPromotions: [{ id: 'p1', code: 'PLAT', autoApply: true, priority: 1 }],
    },
    loading: false,
    error: undefined,
  }),
}));

const cartItemA = {
  id: 'ci-1',
  variantId: 'var-a',
  quantity: 1,
  productVariant: {
    id: 'var-a',
    price: 100,
    product: { id: 'p1', storeId: 'store-a', store: { id: 'store-a', name: 'A' } },
  },
};

const mockCart = {
  loading: false,
  selectedItemCount: 1,
  selectedItems: [cartItemA] as unknown[],
  selectedItemsByStore: [
    {
      storeId: 'store-a',
      storeName: 'A',
      storeSlug: null,
      items: [cartItemA],
      subtotal: 100,
    },
  ],
  selectedSubtotal: 100,
};

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: () => mockCart,
}));

const mockCheckout = {
  promotionCode: null as string | null,
  storePromotionsByStoreId: {} as Record<string, unknown>,
  setPromotion: vi.fn(),
  setPromotionName: vi.fn(),
  setPromotionDiscount: vi.fn(),
  setPromotionFreeUnits: vi.fn(),
  setPromotionProductId: vi.fn(),
  setStorePromotion: vi.fn(),
};

vi.mock('@/lib/providers/CheckoutProvider', () => ({
  useCheckout: () => mockCheckout,
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

const AUTO_APPLY_KEY = 'sopet.checkout.autoApplyAttempted';
const CART_FP = buildAutoApplyCartFingerprint([{ variantId: 'var-a', quantity: 1 }]);

describe('CheckoutAutoApplyController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    resetAutoApplyOnceGateMemory();
    mockCart.loading = false;
    mockCart.selectedItemCount = 1;
    mockCart.selectedItems = [cartItemA];
    mockCart.selectedItemsByStore = [
      {
        storeId: 'store-a',
        storeName: 'A',
        storeSlug: null,
        items: [cartItemA],
        subtotal: 100,
      },
    ];
    mockCart.selectedSubtotal = 100;
    mockCheckout.promotionCode = null;
    mockCheckout.storePromotionsByStoreId = {};
  });

  afterEach(() => {
    sessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  it('renders no UI chrome (no spinner/toast)', () => {
    const { container } = render(<CheckoutAutoApplyController />);
    expect(container).toBeEmptyDOMElement();
    expect(container.querySelector('[data-testid*="auto-apply"]')).toBeNull();
  });

  it('skips run when once-gate is already set for this cart fingerprint', async () => {
    markAutoApplyAttempted(CART_FP);
    expect(hasAutoApplyAttempted(CART_FP)).toBe(true);

    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).not.toHaveBeenCalled();
    });
  });

  it('runs once when ready and marks gate with cart fingerprint after settle', async () => {
    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe(CART_FP);
      expect(hasAutoApplyAttempted(CART_FP)).toBe(true);
    });
  });

  it('does not re-run after remount when gate matches same cart fingerprint', async () => {
    const first = render(<CheckoutAutoApplyController />);
    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
      expect(hasAutoApplyAttempted(CART_FP)).toBe(true);
    });

    first.unmount();
    runCheckoutAutoApply.mockClear();

    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).not.toHaveBeenCalled();
    });
  });

  it('re-runs and clears lanes when cart content fingerprint changes', async () => {
    const first = render(<CheckoutAutoApplyController />);
    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
      expect(hasAutoApplyAttempted(CART_FP)).toBe(true);
    });
    first.unmount();
    runCheckoutAutoApply.mockClear();

    const cartItemB = { ...cartItemA, id: 'ci-1', quantity: 3 };
    mockCart.selectedItems = [cartItemB];
    mockCart.selectedItemsByStore = [
      {
        storeId: 'store-a',
        storeName: 'A',
        storeSlug: null,
        items: [cartItemB],
        subtotal: 300,
      },
    ];
    mockCart.selectedSubtotal = 300;
    mockCheckout.promotionCode = 'OLD_PLAT';
    mockCheckout.storePromotionsByStoreId = {
      'store-a': { code: 'OLD_STORE', name: 'Old', discountAmount: 10 },
    };

    const nextFp = buildAutoApplyCartFingerprint([{ variantId: 'var-a', quantity: 3 }]);
    expect(nextFp).not.toBe(CART_FP);

    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
    });

    expect(mockCheckout.setPromotion).toHaveBeenCalledWith(null);
    expect(mockCheckout.setStorePromotion).toHaveBeenCalledWith('store-a', null);
    expect(runCheckoutAutoApply).toHaveBeenCalledWith(
      expect.objectContaining({
        promotionCode: null,
        storePromotionsByStoreId: {},
      }),
    );

    await waitFor(() => {
      expect(hasAutoApplyAttempted(nextFp)).toBe(true);
      expect(hasAutoApplyAttempted(CART_FP)).toBe(false);
    });
  });
});
