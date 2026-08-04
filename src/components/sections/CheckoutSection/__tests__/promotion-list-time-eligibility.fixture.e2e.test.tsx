// Promotion List-Time Eligibility fixture-e2e Test — Storefront checkout Decision 6 delta
// Design Doc: promotion-universal-conditions-frontend-design.md (§ Delta list-time)
// UI Spec: promotion-universal-conditions-ui-spec.md (AC-039–AC-051, UI-D-005/006/007)
// PRD: promotion-universal-conditions-prd.md (FR-12 / Rules G–H)
// Promoted from: promotion-list-time-eligibility.fixture.e2e.skeleton.tsx
// Generated: 2026-07-17 | Budget Used: integration 0/3, fixture-e2e 3/3, service-e2e 0/2
//
// Delta-named (not appended to promotion-universal-conditions.fixture.e2e.test.tsx):
// Decision 5 fixture-e2e budget already holds guest + BxGy journeys.
//
// Implement target: this file (RTL+MSW). Skeleton stays comment-only.
// MSW: ValidatePromotions batch; Active* catalog-only; useAuth; both Checkout*PromotionModal.
//
// Delta Test Boundaries (Frontend Design Doc):
// Mock: GraphQL validatePromotions / active* via MSW; useAuth
// @real-dependency: none (full-ui mocked backend)
// Assert: NOT_NEW_CUSTOMER list-time; AC-051 banner; exactly one batch on open; apply
// still single validate; store+platform parity
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): List-time hybrid sections + NOT_NEW_CUSTOMER (both modals)
// ---------------------------------------------------------------------------
//
// Journey AC: "Logged-in returning customer opens store then platform promo modal →
// usable under ใช้ได้ตอนนี้ / soft-ineligible under ใช้ไม่ได้ตอนนี้ (Rule G hybrid) →
// new-customer promo shows NOT_NEW_CUSTOMER Thai copy before apply via softReasonOverride
// → unavailable not selectable → exactly one validatePromotions (not N× validatePromotion)
// → confirm still single validatePromotion (AC-039, AC-040, AC-041, AC-042, AC-043,
// AC-046, AC-048 UI half, AC-049, AC-050; UI-D-007)"
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step)
// Behavior: Catalog active* (no eligibility fields) + client-local categorize first paint →
// one ValidatePromotions batch → mergeListTimeEligibility overrides → sections + cards
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW activeStorePromotions / activePlatformPromotions
// (catalog-only AC-047); ValidatePromotions soft items; useAuth logged-in returning;
// CheckoutStorePromotionModal / CheckoutPlatformPromotionModal; softReasonOverride
// @complexity: high
// Primary failure mode: returning customer never sees NOT_NEW_CUSTOMER until apply;
// N× ValidatePromotion on open; unavailable card selectable; batch eligible treated as
// apply grant; store/platform diverge; soft copy missing or color-only
// Proof obligation: MSW catalog returns mix of usable + newCustomer-conditioned +
// min/BxGy soft-ineligible; MSW ValidatePromotions returns ORDER_HISTORY (or ACCOUNT_AGE)
// for conditioned id; spy GraphQL — exactly one ValidatePromotions, zero N-fan-out
// ValidatePromotion on open; assert sections ใช้ได้ตอนนี้ / ใช้ไม่ได้ตอนนี้ membership by
// promotion id (hybrid union); unavailable card warning
// โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น (data-testid=unavailable-promotion-warning) and
// non-interactive (no radio / disabled); confirm still fires single ValidatePromotion.
// Repeat assertions on platform modal (AC-050 parity). Boundary: batch override vs
// client-local; Rule H family collapse on softReasonOverride.
// Verification points / expected results / pass criteria:
// - Available then unavailable section order; counts match hybrid membership (AC-039)
// - Conditioned promo in ใช้ไม่ได้ตอนนี้ before apply with NOT_NEW_CUSTOMER copy (AC-041)
// - Minimum Rule H families renderable via fixtures: NOT_NEW_CUSTOMER, GUEST_REQUIRED,
//   MIN_PURCHASE, BXGY_QTY (AC-042) — at least NOT_NEW_CUSTOMER + one other in journey
// - Warning text present (not color-only) (AC-043)
// - Unavailable not selectable (AC-040); lock / reduced interactivity observable (AC-045 info)
// - Exactly one ValidatePromotions on open; no N× ValidatePromotion (AC-046)
// - Active* responses lack eligibility fields as primary (AC-047 contract in fixture)
// - Confirm path still single ValidatePromotion; batch eligible ≠ auto-apply (AC-048)
// - Store + platform modals identical section/card/merge behavior (AC-049/050)
//
// ---------------------------------------------------------------------------
// Journey 2: AC-051 / UI-D-005 batch failure degraded UX (both modals)
// ---------------------------------------------------------------------------
//
// Journey AC: "When validatePromotions fails or times out, then UI-D-005: keep
// catalog+client-local available; retain client-local ใช้ไม่ได้ตอนนี้; show banner
// ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้ with aria-live=polite; never unlock;
// never treat as apply success (AC-051, AC-049/050)"
// ROI: 72 (BV:9 × Freq:7 + Legal:0 + Defect:9)
// Behavior: Modal open → MSW GraphQL/network error on ValidatePromotions → softEligibilityError
// banner + client-local unavailable retained
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW ValidatePromotions error/timeout;
// client-local categorize fixtures (guest/min/BxGy unavailable); both modals
// @complexity: medium
// Primary failure mode: unavailable wiped empty; banner missing/wrong copy; locked cards
// unlock; failure treated as apply success; aria-live absent
// Proof obligation: Seed client-local unavailable (e.g. guest or min-purchase); MSW
// ValidatePromotions returns GraphQL/network error; assert banner exact Thai string +
// aria-live="polite"; assert client-local unavailable cards still present and locked;
// available from catalog+client-local still shown; onConfirm not called as success.
// Both modals. Optional Retry re-fires batch only (if implemented).
// Verification points / expected results / pass criteria:
// - Banner text === ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้
// - Banner (or live region) has aria-live="polite"
// - Client-local ใช้ไม่ได้ตอนนี้ membership retained (UI-D-005 wins over empty wipe)
// - Cards remain non-selectable / locked; no unlock
// - No apply success side effect from batch failure
// - Store + platform parity
//
// ---------------------------------------------------------------------------
// Journey 3: Available selectable / unapply + confirm authority (AC-044, AC-048)
// ---------------------------------------------------------------------------
//
// Journey AC: "When available cards render and customer selects then confirms, then
// selectable/selected/unapply match Figma information states and confirm still uses
// single validatePromotion — batch eligible never grants apply (AC-044, AC-048)"
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Soft-eligible catalog promo in ใช้ได้ตอนนี้ → select radio/selected frame →
// optional ไม่ใช้ส่วนลด → confirm → single ValidatePromotion MSW
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW ValidatePromotions eligible items;
// ValidatePromotion on confirm; CheckoutStorePromotionModal (platform spot-check optional)
// @complexity: medium
// Primary failure mode: confirm applies from batch alone without ValidatePromotion;
// selected/unapply controls missing; unavailable styled as selectable
// Proof obligation: Batch marks promo eligible; assert available card interactive
// (radio / select); select then ไม่ใช้ส่วนลด clears selection type none; confirm with
// selection fires exactly one ValidatePromotion (not only batch); onConfirm receives
// server validate result. Pixel-perfect Figma is out of scope — assert information
// states (selectable / selected / unapply control present). Boundary: list-time batch
// vs apply-time single validate.
// Verification points / expected results / pass criteria:
// - Available card selectable; selected state observable after click (AC-044 info)
// - ไม่ใช้ส่วนลด / unapply control present and clears discount selection
// - Confirm invokes single ValidatePromotion; batch alone does not call onConfirm success
// - Soft-ineligible cards remain non-selectable in same modal (regression guard)

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
  fixedAmountClampPromotion,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  listTimeMinPurchasePlatformPromotion,
  listTimeMinPurchaseStorePromotion,
  listTimeUsablePlatformPromotion,
  parseConditions,
} from '@/test/mocks/fixtures/promotion-universal-conditions';
import {
  createListTimeAvailableConfirmHandlers,
  createListTimeBatchFailureHandlers,
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

function mockLoggedInReturningAuth() {
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

/** Catalog fixtures must omit eligibility fields (AC-047); accept any object shape. */
function assertCatalogOmitsEligibilityFields(promotion: object) {
  expect(promotion).not.toHaveProperty('eligible');
  expect(promotion).not.toHaveProperty('ineligibilityReason');
}

function assertUnavailableLocked(modal: HTMLElement, warningText: string) {
  const warning = within(modal).getByText(warningText);
  expect(warning).toHaveAttribute('data-testid', 'unavailable-promotion-warning');
  const card = warning.closest('div[class*="opacity-50"]') ?? warning.closest('div');
  expect(card).toBeTruthy();
  expect(within(modal).queryByRole('button', { name: new RegExp(warningText) })).toBeNull();
}

describe('Promotion list-time eligibility fixtures', () => {
  it('exports hybrid catalog fixtures without eligibility fields (AC-047)', () => {
    assertCatalogOmitsEligibilityFields(fixedAmountClampPromotion);
    assertCatalogOmitsEligibilityFields(guestNewCustomerStorePromotion);
    assertCatalogOmitsEligibilityFields(listTimeMinPurchaseStorePromotion);
    assertCatalogOmitsEligibilityFields(listTimeUsablePlatformPromotion);
    assertCatalogOmitsEligibilityFields(guestNewCustomerPlatformPromotion);
    assertCatalogOmitsEligibilityFields(listTimeMinPurchasePlatformPromotion);
    expect(parseConditions(guestNewCustomerStorePromotion.conditions).newCustomer?.enabled).toBe(
      true,
    );
    expect(listTimeMinPurchaseStorePromotion.minPurchaseAmount).toBe(1000);
  });
});

describe('Journey 1 — list-time hybrid + NOT_NEW_CUSTOMER (both modals)', () => {
  beforeEach(() => {
    mockLoggedInReturningAuth();
  });

  it('store modal: hybrid sections, NOT_NEW_CUSTOMER + MIN_PURCHASE, one batch, confirm single validate', async () => {
    const user = userEvent.setup();
    let validatePromotionsCount = 0;
    let validatePromotionCount = 0;
    const onConfirm = vi.fn();

    server.use(
      graphql.query('ActiveStorePromotions', () => {
        return HttpResponse.json({
          data: {
            activeStorePromotions: [
              fixedAmountClampPromotion,
              guestNewCustomerStorePromotion,
              listTimeMinPurchaseStorePromotion,
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
                  id: fixedAmountClampPromotion.id,
                  code: fixedAmountClampPromotion.code,
                  name: fixedAmountClampPromotion.name,
                  eligible: true,
                  ineligibilityReason: null,
                  discountAmount: 100,
                  freeUnits: null,
                },
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
                {
                  __typename: 'PromotionEligibilityResult',
                  id: listTimeMinPurchaseStorePromotion.id,
                  code: listTimeMinPurchaseStorePromotion.code,
                  name: listTimeMinPurchaseStorePromotion.name,
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
              __typename: 'PromotionValidationResult',
              code: fixedAmountClampPromotion.code,
              name: fixedAmountClampPromotion.name,
              discountAmount: 100,
              ineligibilityReason: null,
              freeUnits: null,
            },
          },
        });
      }),
    );

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
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (2)')).toBeInTheDocument();
    });

    // Section order: available before unavailable (AC-039)
    const availableHeading = within(modal).getByText('ใช้ได้ตอนนี้ (1)');
    const unavailableHeading = within(modal).getByText('ใช้ไม่ได้ตอนนี้ (2)');
    expect(
      availableHeading.compareDocumentPosition(unavailableHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(within(modal).getByText('ส่วนลด ฿100.00')).toBeInTheDocument();
    const unavailableWarnings = within(modal).getAllByTestId('unavailable-promotion-warning');
    expect(unavailableWarnings.map((el) => el.textContent)).toEqual(
      expect.arrayContaining([
        SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER,
        SOFT_REASON_FIXTURE_LABELS.MIN_PURCHASE_REMAINING_500,
      ]),
    );
    expect(unavailableWarnings).toHaveLength(2);

    assertUnavailableLocked(modal, SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER);
    expect(within(modal).queryByRole('button', { name: /ลูกค้าใหม่ร้าน/ })).toBeNull();

    await waitFor(() => {
      expect(validatePromotionsCount).toBe(1);
    });
    expect(validatePromotionCount).toBe(0);
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(within(modal).getByText('ส่วนลด ฿100.00'));
    await user.click(within(modal).getByTestId('store-promotion-confirm-button'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          code: fixedAmountClampPromotion.code,
          discountAmount: 100,
        }),
      );
    });
    expect(validatePromotionCount).toBe(1);
    expect(validatePromotionsCount).toBe(1);
  });

  it('platform modal: same hybrid partition + NOT_NEW_CUSTOMER + MIN_PURCHASE (AC-049/050)', async () => {
    let validatePromotionsCount = 0;
    let validatePromotionCount = 0;
    const onConfirm = vi.fn();

    server.use(
      graphql.query('ActivePlatformPromotions', () => {
        return HttpResponse.json({
          data: {
            activePlatformPromotions: [
              listTimeUsablePlatformPromotion,
              guestNewCustomerPlatformPromotion,
              listTimeMinPurchasePlatformPromotion,
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
                  id: listTimeUsablePlatformPromotion.id,
                  code: listTimeUsablePlatformPromotion.code,
                  name: listTimeUsablePlatformPromotion.name,
                  eligible: true,
                  ineligibilityReason: null,
                  discountAmount: 50,
                  freeUnits: null,
                },
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
                {
                  __typename: 'PromotionEligibilityResult',
                  id: listTimeMinPurchasePlatformPromotion.id,
                  code: listTimeMinPurchasePlatformPromotion.code,
                  name: listTimeMinPurchasePlatformPromotion.name,
                  eligible: true,
                  ineligibilityReason: null,
                  discountAmount: 40,
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
              __typename: 'PromotionValidationResult',
              code: listTimeUsablePlatformPromotion.code,
              name: listTimeUsablePlatformPromotion.name,
              discountAmount: 50,
              ineligibilityReason: null,
              freeUnits: null,
            },
          },
        });
      }),
    );

    render(
      <ApolloTestWrapper>
        <CheckoutPlatformPromotionModal
          isOpen
          subtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={onConfirm}
        />
      </ApolloTestWrapper>,
    );

    const modal = await screen.findByTestId('checkout-platform-promotion-modal');

    await waitFor(() => {
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (2)')).toBeInTheDocument();
    });

    // Section order: available before unavailable (AC-039)
    const availableHeading = within(modal).getByText('ใช้ได้ตอนนี้ (1)');
    const unavailableHeading = within(modal).getByText('ใช้ไม่ได้ตอนนี้ (2)');
    expect(
      availableHeading.compareDocumentPosition(unavailableHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(within(modal).getByRole('button', { name: /ส่วนลด ฿50/ })).toBeInTheDocument();
    const unavailableWarnings = within(modal).getAllByTestId('unavailable-promotion-warning');
    expect(unavailableWarnings.map((el) => el.textContent)).toEqual(
      expect.arrayContaining([
        SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER,
        SOFT_REASON_FIXTURE_LABELS.MIN_PURCHASE_REMAINING_500,
      ]),
    );
    expect(unavailableWarnings).toHaveLength(2);
    assertUnavailableLocked(modal, SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER);

    await waitFor(() => {
      expect(validatePromotionsCount).toBe(1);
    });
    expect(validatePromotionCount).toBe(0);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('Journey 2 — AC-051 / UI-D-005 batch failure (both modals)', () => {
  beforeEach(() => {
    mockGuestAuth();
    server.use(...createListTimeBatchFailureHandlers());
  });

  it('store modal: banner exact Thai + aria-live; retain client-local available + unavailable; no apply', async () => {
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
    expect(banner).toHaveTextContent('ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('role', 'status');

    expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
    expect(within(modal).getByText('ส่วนลด ฿100.00')).toBeInTheDocument();
    expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
    );
    assertUnavailableLocked(modal, SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('platform modal: same AC-051 banner + retain client-local (AC-050 parity)', async () => {
    const onConfirm = vi.fn();

    render(
      <ApolloTestWrapper>
        <CheckoutPlatformPromotionModal
          isOpen
          subtotal={500}
          appliedPromotion={null}
          onClose={vi.fn()}
          onConfirm={onConfirm}
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

    expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
    expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
    );
    assertUnavailableLocked(modal, SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('Journey 3 — available selectable / unapply + confirm authority (AC-044, AC-048)', () => {
  beforeEach(() => {
    mockLoggedInReturningAuth();
  });

  it('store modal: select → ไม่ใช้ส่วนลด clears → confirm fires single ValidatePromotion', async () => {
    const user = userEvent.setup();
    let validatePromotionsCount = 0;
    let validatePromotionCount = 0;
    const onConfirm = vi.fn();

    server.use(
      graphql.query('ValidatePromotions', () => {
        validatePromotionsCount += 1;
        return HttpResponse.json({
          data: {
            validatePromotions: {
              __typename: 'ValidatePromotionsResult',
              items: [
                {
                  __typename: 'PromotionEligibilityResult',
                  id: fixedAmountClampPromotion.id,
                  code: fixedAmountClampPromotion.code,
                  name: fixedAmountClampPromotion.name,
                  eligible: true,
                  ineligibilityReason: null,
                  discountAmount: 100,
                  freeUnits: null,
                },
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
      graphql.query('ValidatePromotion', () => {
        validatePromotionCount += 1;
        return HttpResponse.json({
          data: {
            validatePromotion: {
              __typename: 'PromotionValidationResult',
              code: fixedAmountClampPromotion.code,
              name: fixedAmountClampPromotion.name,
              discountAmount: 100,
              ineligibilityReason: null,
              freeUnits: null,
            },
          },
        });
      }),
      ...createListTimeAvailableConfirmHandlers(),
    );

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
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(validatePromotionsCount).toBe(1);
    });
    expect(validatePromotionCount).toBe(0);
    expect(onConfirm).not.toHaveBeenCalled();

    const availableCard = within(modal).getByRole('button', { name: /ส่วนลด ฿100/ });
    await user.click(availableCard);

    await waitFor(() => {
      expect(within(modal).getByText('- ฿100.00')).toBeInTheDocument();
    });

    expect(within(modal).getByText('ไม่ใช้ส่วนลด')).toBeInTheDocument();
    await user.click(within(modal).getByText('ไม่ใช้ส่วนลด'));

    await waitFor(() => {
      expect(within(modal).queryByText('- ฿100.00')).not.toBeInTheDocument();
    });

    // Soft-ineligible remains non-selectable (regression guard)
    expect(within(modal).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
      SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER,
    );
    assertUnavailableLocked(modal, SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER);

    await user.click(within(modal).getByRole('button', { name: /ส่วนลด ฿100/ }));
    await user.click(within(modal).getByTestId('store-promotion-confirm-button'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          code: fixedAmountClampPromotion.code,
          discountAmount: 100,
        }),
      );
    });
    expect(validatePromotionCount).toBe(1);
    expect(validatePromotionsCount).toBe(1);
  });
});
