import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutAutoApplyController } from '@/components/sections/CheckoutSection/CheckoutAutoApplyController';
import {
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

const mockCart = {
  loading: false,
  selectedItemCount: 1,
  selectedItems: [],
  selectedItemsByStore: [
    { storeId: 'store-a', storeName: 'A', storeSlug: null, items: [], subtotal: 100 },
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

const AUTO_APPLY_KEY = 'sopet.checkout.autoApplyAttempted';

describe('CheckoutAutoApplyController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    resetAutoApplyOnceGateMemory();
    mockCart.loading = false;
    mockCart.selectedItemCount = 1;
    mockCheckout.promotionCode = null;
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

  it('skips run when once-gate is already set', async () => {
    markAutoApplyAttempted();
    expect(hasAutoApplyAttempted()).toBe(true);

    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).not.toHaveBeenCalled();
    });
  });

  it('runs once when ready and marks gate after settle including zero apply', async () => {
    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
      expect(hasAutoApplyAttempted()).toBe(true);
    });
  });

  it('does not re-run after remount when gate is set', async () => {
    const first = render(<CheckoutAutoApplyController />);
    await waitFor(() => {
      expect(runCheckoutAutoApply).toHaveBeenCalledTimes(1);
      expect(hasAutoApplyAttempted()).toBe(true);
    });

    first.unmount();
    runCheckoutAutoApply.mockClear();

    render(<CheckoutAutoApplyController />);

    await waitFor(() => {
      expect(runCheckoutAutoApply).not.toHaveBeenCalled();
    });
  });
});
