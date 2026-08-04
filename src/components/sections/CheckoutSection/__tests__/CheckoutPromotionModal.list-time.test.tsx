/**
 * List-time hybrid wiring — CheckoutStorePromotionModal + CheckoutPlatformPromotionModal.
 * AC-041 softReasonOverride, AC-046 one batch on open, AC-048 confirm single validate,
 * AC-051 / UI-D-005 banner degrade. Full multi-step journeys → task-3.2 fixture-e2e.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutPlatformPromotionModal } from '@/components/sections/CheckoutPromotionSection/CheckoutPlatformPromotionModal';
import { CheckoutStorePromotionModal } from '@/components/sections/CheckoutSection/CheckoutStorePromotionModal';
import { SOFT_ELIGIBILITY_ERROR_MESSAGE } from '@/components/sections/CheckoutSection/StorePromotionCouponCard';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CHECKOUT_STORE_ID } from '@/test/mocks/fixtures/checkout';
import {
  AUTH_MOCK_USAGE,
  SOFT_REASON_FIXTURE_LABELS,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  validatePromotionBxGyEligible,
} from '@/test/mocks/fixtures/promotion-universal-conditions';
import {
  guestJourneyPromotionHandlers,
  validatePromotionsTransportErrorHandlers,
} from '@/test/mocks/promotion-universal-conditions.handlers';
import { server } from '@/test/mocks/server';

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    return <img alt={props.alt ?? ''} />;
  },
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);
const ApolloTestWrapper = createApolloTestWrapper();

function mockLoggedInAuth() {
  mockedUseAuth.mockReturnValue({
    customer: AUTH_MOCK_USAGE.loggedIn.useAuthReturn.customer as never,
    isAuthenticated: true,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  });
}

function mockGuestAuth() {
  mockedUseAuth.mockReturnValue({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  });
}

function storeOrderHistorySoftHandlers() {
  return [
    ...guestJourneyPromotionHandlers,
    graphql.query('ValidatePromotions', () => {
      return HttpResponse.json({
        data: {
          validatePromotions: {
            __typename: 'ValidatePromotionsResult',
            items: [
              {
                __typename: 'PromotionEligibilityResult',
                id: guestNewCustomerStorePromotion.id,
                code: guestNewCustomerStorePromotion.code,
                name: guestNewCustomerStorePromotion.name,
                eligible: false,
                ineligibilityReason: 'ORDER_HISTORY',
                discountAmount: 0,
                freeUnits: null,
              },
            ],
          },
        },
      });
    }),
  ];
}

function platformOrderHistorySoftHandlers() {
  return [
    ...guestJourneyPromotionHandlers,
    graphql.query('ValidatePromotions', () => {
      return HttpResponse.json({
        data: {
          validatePromotions: {
            __typename: 'ValidatePromotionsResult',
            items: [
              {
                __typename: 'PromotionEligibilityResult',
                id: guestNewCustomerPlatformPromotion.id,
                code: guestNewCustomerPlatformPromotion.code,
                name: guestNewCustomerPlatformPromotion.name,
                eligible: false,
                ineligibilityReason: 'ORDER_HISTORY',
                discountAmount: 0,
                freeUnits: null,
              },
            ],
          },
        },
      });
    }),
  ];
}

describe('Checkout promotion modals — list-time hybrid wiring', () => {
  beforeEach(() => {
    mockLoggedInAuth();
  });

  it('store modal: ORDER_HISTORY batch → NOT_NEW_CUSTOMER softReasonOverride before apply (AC-041)', async () => {
    server.use(...storeOrderHistorySoftHandlers());

    render(
      <ApolloTestWrapper>
        <CheckoutStorePromotionModal
          isOpen
          storeId={CHECKOUT_STORE_ID}
          storeName="ร้านทดสอบ"
          storeSubtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-store-promotion-modal');

    await waitFor(() => {
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER,
    );
    expect(within(modal).queryByText('ใช้ได้ตอนนี้')).not.toBeInTheDocument();
    expect(within(modal).queryByTestId('soft-eligibility-error-banner')).not.toBeInTheDocument();
  });

  it('platform modal: ORDER_HISTORY batch → NOT_NEW_CUSTOMER softReasonOverride (AC-050 parity)', async () => {
    server.use(...platformOrderHistorySoftHandlers());

    render(
      <ApolloTestWrapper>
        <CheckoutPlatformPromotionModal
          isOpen
          subtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-platform-promotion-modal');

    await waitFor(() => {
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER,
    );
  });

  it('store modal: one ValidatePromotions on open; zero ValidatePromotion until confirm (AC-046/048)', async () => {
    const user = userEvent.setup();
    let validatePromotionsCount = 0;
    let validatePromotionCount = 0;

    server.use(
      graphql.query('ActiveStorePromotions', () => {
        return HttpResponse.json({
          data: {
            activeStorePromotions: [
              {
                ...guestNewCustomerStorePromotion,
                conditions: null,
              },
            ],
          },
        });
      }),
      graphql.query('ValidatePromotions', () => {
        validatePromotionsCount += 1;
        return HttpResponse.json({
          data: {
            validatePromotions: {
              __typename: 'ValidatePromotionsResult',
              items: [
                {
                  __typename: 'PromotionEligibilityResult',
                  id: guestNewCustomerStorePromotion.id,
                  code: guestNewCustomerStorePromotion.code,
                  name: guestNewCustomerStorePromotion.name,
                  eligible: true,
                  ineligibilityReason: null,
                  discountAmount: 50,
                  freeUnits: null,
                },
              ],
            },
          },
        });
      }),
      graphql.query('ValidatePromotion', () => {
        validatePromotionCount += 1;
        return HttpResponse.json({
          data: {
            validatePromotion: {
              ...validatePromotionBxGyEligible,
              code: guestNewCustomerStorePromotion.code,
              name: guestNewCustomerStorePromotion.name,
              discountAmount: 50,
              freeUnits: null,
              ineligibilityReason: null,
            },
          },
        });
      }),
    );

    const onConfirm = vi.fn();

    render(
      <ApolloTestWrapper>
        <CheckoutStorePromotionModal
          isOpen
          storeId={CHECKOUT_STORE_ID}
          storeName="ร้านทดสอบ"
          storeSubtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={onConfirm}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-store-promotion-modal');

    await waitFor(() => {
      expect(validatePromotionsCount).toBe(1);
    });
    expect(validatePromotionCount).toBe(0);

    await waitFor(() => {
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    await user.click(within(modal).getByText('ส่วนลด 10%'));
    await user.click(within(modal).getByTestId('store-promotion-confirm-button'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
    expect(validatePromotionCount).toBe(1);
    expect(validatePromotionsCount).toBe(1);
  });

  it('store modal: batch transport error → AC-051 banner + retain client-local unavailable (UI-D-005)', async () => {
    mockGuestAuth();
    server.use(...guestJourneyPromotionHandlers, ...validatePromotionsTransportErrorHandlers);

    const onConfirm = vi.fn();

    render(
      <ApolloTestWrapper>
        <CheckoutStorePromotionModal
          isOpen
          storeId={CHECKOUT_STORE_ID}
          storeName="ร้านทดสอบ"
          storeSubtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={onConfirm}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-store-promotion-modal');

    await waitFor(() => {
      expect(within(modal).getByTestId('soft-eligibility-error-banner')).toBeInTheDocument();
    });

    const banner = within(modal).getByTestId('soft-eligibility-error-banner');
    expect(banner).toHaveTextContent(SOFT_ELIGIBILITY_ERROR_MESSAGE);
    expect(banner).toHaveAttribute('aria-live', 'polite');

    expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('platform modal: batch transport error → same AC-051 banner + retain client-local (AC-050)', async () => {
    mockGuestAuth();
    server.use(...guestJourneyPromotionHandlers, ...validatePromotionsTransportErrorHandlers);

    render(
      <ApolloTestWrapper>
        <CheckoutPlatformPromotionModal
          isOpen
          subtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-platform-promotion-modal');

    await waitFor(() => {
      expect(within(modal).getByTestId('soft-eligibility-error-banner')).toBeInTheDocument();
    });

    const banner = within(modal).getByTestId('soft-eligibility-error-banner');
    expect(banner).toHaveTextContent(SOFT_ELIGIBILITY_ERROR_MESSAGE);
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
  });

  it('store modal coupon grids use gap-sop-8px (UI-D-006)', async () => {
    server.use(...storeOrderHistorySoftHandlers());

    const { container } = render(
      <ApolloTestWrapper>
        <CheckoutStorePromotionModal
          isOpen
          storeId={CHECKOUT_STORE_ID}
          storeName="ร้านทดสอบ"
          storeSubtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      </ApolloTestWrapper>,
    );

    await screen.findByTestId('checkout-store-promotion-modal');

    await waitFor(() => {
      expect(screen.getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    const grids = container.querySelectorAll('.gap-sop-8px');
    expect(grids.length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('.gap-sop-12px.sm\\:grid-cols-2')).toBeNull();
  });
});
