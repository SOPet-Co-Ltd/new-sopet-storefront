// Promotion Auto-Apply fixture-e2e Test — Storefront checkout one-shot journey
// Design Doc: promotion-auto-apply-frontend-design.md
// UI Spec: promotion-auto-apply-ui-spec.md (UI-AA-004–007, golden states 3–6)
// PRD: promotion-auto-apply-prd.md (AC-007–009, AC-012, AC-018–023; Rules AA1, AA3, C1)
// ADR: ADR-0008-promotion-auto-apply-checkout.md
// Parent pattern: promotion-universal-conditions.fixture.e2e.test.tsx
// Promoted from: promotion-auto-apply.fixture.e2e.skeleton.tsx
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: Apollo validatePromotion / activePlatformPromotions / activeStorePromotions — MSW
// @real-dependency: CheckoutProvider (dual-lane writes + applied UI); sessionStorage once-gate;
// CheckoutAutoApplyController (production mount; gate via controller.finally)
// Injectable fetch seams for lists/validate belong in integration case 3 only — not here.
//
// Known limitation (Design Doc § Shipping Zero-Discount Display): store row success chrome
// keys off discountAmount > 0 — shipping-type winners with 0 may show “เพิ่มส่วนลดร้านค้า”
// while code is set (parity with manual apply).

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutSummarySection } from '@/components/molecules/CheckoutSummarySection/CheckoutSummarySection';
import { CheckoutPromotionSection } from '@/components/sections/CheckoutPromotionSection/CheckoutPromotionSection';
import { CheckoutAutoApplyController } from '@/components/sections/CheckoutSection/CheckoutAutoApplyController';
import { CheckoutStoreActionsRow } from '@/components/sections/CheckoutSection/CheckoutStoreActionsRow';
import {
  hasAutoApplyAttempted,
  resetAutoApplyOnceGateMemory,
} from '@/lib/checkout/autoApplyOnceGate';
import { CheckoutProvider, useCheckout } from '@/lib/providers/CheckoutProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleCartItem } from '@/test/mocks/fixtures/cart';
import {
  AUTO_APPLY_STORE_A_ID,
  AUTO_APPLY_STORE_B_ID,
  autoApplyPlatformPromotion,
} from '@/test/mocks/fixtures/promotion-auto-apply';
import {
  promotionAutoApplyHandlers,
  promotionAutoApplySoftFailHandlers,
  promotionAutoApplyZeroCandidatesHandlers,
} from '@/test/mocks/promotion-auto-apply.handlers';
import { server } from '@/test/mocks/server';

const AUTO_APPLY_KEY = 'sopet.checkout.autoApplyAttempted';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/checkout',
}));

vi.mock('next/image', () => ({
  default: (props: { alt?: string; src?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    return <img alt={props.alt ?? ''} src={props.src || 'https://example.com/test.png'} />;
  },
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: { id: 'cust-1', phone: '0812345678' },
    isAuthenticated: true,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/useShippingOptions', () => ({
  useShippingOptions: () => ({
    options: [
      {
        id: 'ship-1',
        storeId: AUTO_APPLY_STORE_A_ID,
        name: 'มาตรฐาน',
        description: null,
        price: 50,
        isActive: true,
        sortOrder: 1,
        providerId: null,
      },
    ],
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

const storeAItem = {
  ...sampleCartItem,
  id: 'cart-item-a',
  productVariant: {
    ...sampleCartItem.productVariant!,
    id: 'var-a',
    product: {
      ...sampleCartItem.productVariant!.product!,
      storeId: AUTO_APPLY_STORE_A_ID,
      store: {
        id: AUTO_APPLY_STORE_A_ID,
        name: 'ร้าน A',
        slug: 'store-a',
      },
    },
  },
};

const storeBItem = {
  ...sampleCartItem,
  id: 'cart-item-b',
  productVariant: {
    ...sampleCartItem.productVariant!,
    id: 'var-b',
    price: 400,
    product: {
      ...sampleCartItem.productVariant!.product!,
      id: 'prod-b',
      storeId: AUTO_APPLY_STORE_B_ID,
      store: {
        id: AUTO_APPLY_STORE_B_ID,
        name: 'ร้าน B',
        slug: 'store-b',
      },
    },
  },
};

const cartGroups = [
  {
    storeId: AUTO_APPLY_STORE_A_ID,
    storeName: 'ร้าน A',
    storeSlug: 'store-a',
    items: [storeAItem],
    subtotal: storeAItem.quantity * (storeAItem.productVariant?.price ?? 0),
  },
  {
    storeId: AUTO_APPLY_STORE_B_ID,
    storeName: 'ร้าน B',
    storeSlug: 'store-b',
    items: [storeBItem],
    subtotal: storeBItem.quantity * (storeBItem.productVariant?.price ?? 0),
  },
];

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: () => ({
    loading: false,
    selectedItemCount: 2,
    selectedItems: [storeAItem, storeBItem],
    selectedItemsByStore: cartGroups,
    selectedSubtotal: cartGroups.reduce((sum, group) => sum + group.subtotal, 0),
    refetch: vi.fn(),
    pruneDeselectedIds: vi.fn(),
  }),
}));

const ApolloTestWrapper = createApolloTestWrapper();

/**
 * Ensures C1 snapshot sees prefilled platform before CheckoutAutoApplyController mounts.
 * Does not call markAutoApplyAttempted — gate is owned by the production controller.finally.
 */
function PrefillGate({
  prefillPlatformCode,
  children,
}: {
  prefillPlatformCode?: string;
  children: (ready: boolean) => ReactNode;
}) {
  const { promotionCode, setPromotion, setPromotionName, setPromotionDiscount } = useCheckout();
  const [bootstrapped, setBootstrapped] = useState(!prefillPlatformCode);

  useEffect(() => {
    if (!prefillPlatformCode) {
      return;
    }
    /* eslint-disable react-hooks/set-state-in-effect -- fixture prefill before C1 snapshot */
    setPromotion(prefillPlatformCode);
    setPromotionName('ผู้ใช้เลือกไว้');
    setPromotionDiscount(5);
    setBootstrapped(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [prefillPlatformCode, setPromotion, setPromotionDiscount, setPromotionName]);

  const ready = !prefillPlatformCode || (bootstrapped && promotionCode === prefillPlatformCode);

  return <>{children(ready)}</>;
}

function AutoApplyCheckoutHarness({ prefillPlatformCode }: { prefillPlatformCode?: string }) {
  return (
    <ApolloTestWrapper>
      <CheckoutProvider>
        <div data-testid="auto-apply-harness">
          <PrefillGate prefillPlatformCode={prefillPlatformCode}>
            {(ready) => (ready ? <CheckoutAutoApplyController /> : null)}
          </PrefillGate>
          <CheckoutPromotionSection />
          <CheckoutStoreActionsRow
            storeId={AUTO_APPLY_STORE_A_ID}
            storeName="ร้าน A"
            storeSubtotal={1780}
          />
          <CheckoutStoreActionsRow
            storeId={AUTO_APPLY_STORE_B_ID}
            storeName="ร้าน B"
            storeSubtotal={800}
          />
          <CheckoutSummarySection guestForm={null} />
        </div>
      </CheckoutProvider>
    </ApolloTestWrapper>
  );
}

describe('Promotion auto-apply fixture-e2e', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  afterEach(() => {
    sessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  // ---------------------------------------------------------------------------
  // Journey 1 (RESERVED): First /checkout entry → dual-lane auto-apply
  // ---------------------------------------------------------------------------
  describe('Journey 1 — dual-lane apply → existing applied UI + gate', () => {
    beforeEach(() => {
      server.use(...promotionAutoApplyHandlers);
    });

    it('auto-applies platform + both stores; FR-8 surfaces; no toast; gate set (AC-007/008/012/023)', async () => {
      render(<AutoApplyCheckoutHarness />);

      const platformCard = await screen.findByTestId('applied-platform-promotion', undefined, {
        timeout: 5000,
      });
      expect(platformCard).toHaveTextContent(autoApplyPlatformPromotion.name);

      await waitFor(() => {
        expect(
          within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`)).getByText(
            /ใช้ส่วนลด/,
          ),
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_B_ID}`)).getByText(
            /ใช้ส่วนลด/,
          ),
        ).toBeInTheDocument();
      });

      const summaryRoot = screen.getByText('สรุปคำสั่งซื้อ').closest('div.w-full');
      expect(summaryRoot).toBeTruthy();
      expect(within(summaryRoot as HTMLElement).getByText('ส่วนลดแพลตฟอร์ม')).toBeInTheDocument();
      expect(within(summaryRoot as HTMLElement).getByText('ส่วนลดร้านค้า')).toBeInTheDocument();

      expect(
        screen.queryByRole('status', { name: /auto-apply|อัตโนมัติ/i }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('auto-apply-spinner')).not.toBeInTheDocument();
      expect(screen.queryByText(/กำลังใช้อัตโนมัติ/)).not.toBeInTheDocument();

      // Gate only after CheckoutAutoApplyController.finally settles (not harness-owned).
      await waitFor(() => {
        expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
        expect(hasAutoApplyAttempted()).toBe(true);
      });

      expect(
        within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`)).getByText(
          /฿30/,
        ),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_B_ID}`)).getByText(
          /฿40/,
        ),
      ).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Journey 2: C1 skip + remount gate + soft-fail / zero candidates still gate
  // ---------------------------------------------------------------------------
  describe('Journey 2 — C1 + remount gate + soft-fail/zero still gate', () => {
    it('skips prefilled platform (C1) while filling empty store lanes (AC-018/020)', async () => {
      server.use(...promotionAutoApplyHandlers);

      render(<AutoApplyCheckoutHarness prefillPlatformCode="USER_KEEP" />);

      await waitFor(() => {
        expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
      });

      expect(screen.queryByText(autoApplyPlatformPromotion.name)).not.toBeInTheDocument();
      expect(screen.getByTestId('applied-platform-promotion')).toHaveTextContent('ผู้ใช้เลือกไว้');

      await waitFor(() => {
        expect(
          within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`)).getByText(
            /ใช้ส่วนลด/,
          ),
        ).toBeInTheDocument();
      });
    });

    it('remount with gate set does not re-apply (AC-009/019)', async () => {
      server.use(...promotionAutoApplyHandlers);

      const { unmount } = render(<AutoApplyCheckoutHarness />);
      await waitFor(() => {
        expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
        expect(screen.getByTestId('applied-platform-promotion')).toBeInTheDocument();
      });

      unmount();

      render(
        <ApolloTestWrapper>
          <CheckoutProvider>
            <div data-testid="auto-apply-harness">
              <CheckoutAutoApplyController />
              <CheckoutPromotionSection />
              <CheckoutStoreActionsRow
                storeId={AUTO_APPLY_STORE_A_ID}
                storeName="ร้าน A"
                storeSubtotal={1780}
              />
            </div>
          </CheckoutProvider>
        </ApolloTestWrapper>,
      );

      await waitFor(() => {
        expect(hasAutoApplyAttempted()).toBe(true);
      });

      expect(screen.queryByTestId('applied-platform-promotion')).not.toBeInTheDocument();
      expect(
        within(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`)).queryByText(
          /ใช้ส่วนลด/,
        ),
      ).not.toBeInTheDocument();
    });

    it('zero autoApply candidates still sets gate; manual picker usable (AC-021/022)', async () => {
      server.use(...promotionAutoApplyZeroCandidatesHandlers);
      const user = userEvent.setup();

      render(<AutoApplyCheckoutHarness />);

      await waitFor(() => {
        expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
      });

      expect(screen.queryByTestId('applied-platform-promotion')).not.toBeInTheDocument();

      await user.click(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`));
      expect(await screen.findByTestId('checkout-store-promotion-modal')).toBeInTheDocument();
    });

    it('soft-fail validates still set gate; manual picker usable; no auto-apply toast (AC-014/019, UI-AA-007)', async () => {
      server.use(...promotionAutoApplySoftFailHandlers);
      const user = userEvent.setup();

      render(<AutoApplyCheckoutHarness />);

      await waitFor(() => {
        expect(sessionStorage.getItem(AUTO_APPLY_KEY)).toBe('1');
      });

      expect(screen.queryByTestId('applied-platform-promotion')).not.toBeInTheDocument();
      expect(screen.queryByText(/auto-apply|ใช้อัตโนมัติล้มเหลว/i)).not.toBeInTheDocument();

      await user.click(screen.getByTestId(`checkout-store-discount-${AUTO_APPLY_STORE_A_ID}`));
      expect(await screen.findByTestId('checkout-store-promotion-modal')).toBeInTheDocument();
    });
  });
});
