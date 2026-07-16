// Promotion Logged-In Only fixture-e2e Test — Storefront checkout
// Design Doc: promotion-logged-in-only-frontend-design.md
// UI Spec: promotion-logged-in-only-ui-spec.md
// PRD: promotion-logged-in-only-prd.md (AC-003, AC-004, AC-006, AC-007, AC-010, AC-011,
// AC-018, AC-019, AC-021)
// Parent pattern: promotion-universal-conditions.fixture.e2e.test.tsx
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 2/3 (reserved + slot 3),
// service-e2e 0/2
//
// Implement target: this file (RTL+MSW fixture-e2e). Comment-only until FE soft OR-gate lands.
// Feature fixture-e2e budget (3/3 total): admin create journey (sopet-admin skeleton) +
// this file's Journey 1 (reserved) + Journey 2.
//
// Auth mock usage (extend parent AUTH_MOCK_USAGE / fixtures):
// - Guest Journey 1: vi.mock useAuth → AUTH_MOCK_USAGE.guest
// - Logged-in Journey 2: vi.mock useAuth → AUTH_MOCK_USAGE.loggedInMembersOnly
// MSW fixtures (src/test/mocks/fixtures/promotion-universal-conditions.ts):
// - loggedInOnly-only: guestLoggedInOnlyStorePromotion / guestLoggedInOnlyPlatformPromotion
// - both-keys: guestLoggedInOnlyAndNewCustomerStorePromotion / ...PlatformPromotion
// - newCustomer-only regression: guestNewCustomerStorePromotion / ...PlatformPromotion
// MSW handlers (src/test/mocks/promotion-universal-conditions.handlers.ts):
// - guestLoggedInOnlyJourneyPromotionHandlers / guestBothKeysJourneyPromotionHandlers
// - loggedInLoggedInOnlyJourneyPromotionHandlers / guestJourneyPromotionHandlers (newCustomer-only)
// optional validatePromotion soft GUEST: validatePromotionLoggedInOnlyGuestRequired
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): Guest soft OR-gate + GUEST_REQUIRED reuse for loggedInOnly
// ---------------------------------------------------------------------------
//
// Journey AC: "Guest at checkout opens store/platform promo modal → loggedInOnly-conditioned
// promo appears unavailable with exact GUEST_REQUIRED warning + เข้าสู่ระบบ → /login;
// both loggedInOnly+newCustomer still single GUEST_REQUIRED string; newCustomer-only
// regression remains (AC-003, AC-004, AC-010, AC-011 soft, AC-019, UI-L-003, UI-L-005)
// — S-Checkout → S-Checkout-*-Modal → LoginHint"
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step)
// Behavior: Guest session + active promo with conditions.loggedInOnly.enabled →
// UnavailableStorePromotionCard with exact GUEST_REQUIRED copy + login CTA; apply blocked;
// guest + both keys → same single string; guest + newCustomer-only still GUEST_REQUIRED
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW activeStorePromotions / activePlatformPromotions
// with conditions JSON; useAuth guest; CheckoutStorePromotionModal / CheckoutPlatformPromotionModal;
// shared storePromotionUtils OR-gate
// @complexity: high
// Primary failure mode: guest can select/apply loggedInOnly-only promo (client OR-gate gap);
// soft copy invents MEMBERS_ONLY or dual messaging when both keys on; CTA absent;
// availablePromotionCount still counts members-only for guests
// Proof obligation: MSW fixtures return platform and store promos with
// loggedInOnly:{enabled:true} (and a both-keys variant); mock useAuth as guest; open store
// then platform promo modals; assert UnavailableStorePromotionCard warning equals existing
// GUEST_REQUIRED_WARNING and CTA เข้าสู่ระบบ → /login; assert promo absent from selectable
// available list; assert availablePromotionCount / categorize excludes gated promos when
// isGuest passed. newCustomer-only fixture still unavailable (AC-010 regression). Shared
// storePromotionUtils only — no fork. Boundary: guest + (loggedInOnly OR newCustomer)
// availability path (UI-L-005). Soft validate GUEST → GUEST_REQUIRED map reused (AC-018/019).
// Verification points / expected results / pass criteria:
// - loggedInOnly-only promo in unavailable list for guest (store and platform modals)
// - Warning copy exact: โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก
// - Login CTA labeled เข้าสู่ระบบ and href/navigation /login
// - Both keys on: single GUEST_REQUIRED string (no stacked soft copy) — UI-L-003
// - newCustomer-only guest path still GUEST_REQUIRED (AC-010)
// - Members-only / new-customer promos excluded from available count when isGuest
// - Selecting/applying gated code as guest does not mark promo applied
//
// ---------------------------------------------------------------------------
// Journey 2: Logged-in shopper — only-loggedInOnly available (no forced new-customer UX)
// ---------------------------------------------------------------------------
//
// Journey AC: "Logged-in shopper at checkout views only-loggedInOnly promo that passes other
// client rules → card available; no forced new-customer messaging (AC-006/007 display);
// soft GUEST from validatePromotion still maps to GUEST_REQUIRED without new reason
// (AC-018/019)"
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Auth customer + loggedInOnly-only promo → available list; no NOT_NEW_CUSTOMER /
// guest messaging forced; optional MSW soft GUEST maps to existing GUEST_REQUIRED constants
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW active promotions with loggedInOnly only;
// useAuth authenticated; checkout modals
// @complexity: medium
// Primary failure mode: logged-in shopper sees only-loggedInOnly as unavailable; or UI
// forces new-customer messaging when newCustomer key is off
// Proof obligation: mock useAuth authenticated; MSW promo with only
// loggedInOnly:{enabled:true} (no newCustomer); open store/platform modals; assert promo in
// available list / selectable; assert absence of NOT_NEW_CUSTOMER copy. Optional: MSW
// validatePromotion soft ineligibilityReason=GUEST → UI still uses GUEST_REQUIRED constants
// (reuse, no new string). Boundary: client availability for authenticated + only-loggedInOnly.
// Verification points / expected results / pass criteria:
// - only-loggedInOnly promo appears available for logged-in shopper when other client rules pass
// - No forced ลูกค้าใหม่ / NOT_NEW_CUSTOMER messaging when newCustomer key absent
// - Soft GUEST from API (if exercised) maps to existing GUEST_REQUIRED warning/CTA constants

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutPlatformPromotionModal } from '@/components/sections/CheckoutPromotionSection/CheckoutPlatformPromotionModal';
import { CheckoutStorePromotionModal } from '@/components/sections/CheckoutSection/CheckoutStorePromotionModal';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  AUTH_MOCK_USAGE,
  SOFT_REASON_FIXTURE_LABELS,
  buildLoggedInOnlyAndNewCustomerConditions,
  buildLoggedInOnlyConditions,
  buildNewCustomerConditions,
  guestLoggedInOnlyAndNewCustomerStorePromotion,
  guestLoggedInOnlyPlatformPromotion,
  guestLoggedInOnlyStorePromotion,
  guestNewCustomerStorePromotion,
  parseConditions,
} from '@/test/mocks/fixtures/promotion-universal-conditions';
import { CHECKOUT_STORE_ID } from '@/test/mocks/fixtures/checkout';
import {
  createLoggedInOnlyJourneyPromotionHandlers,
  guestBothKeysJourneyPromotionHandlers,
  guestJourneyPromotionHandlers,
  guestLoggedInOnlyJourneyPromotionHandlers,
  loggedInLoggedInOnlyJourneyPromotionHandlers,
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

function mockGuestAuth() {
  mockedUseAuth.mockReturnValue({
    customer: null,
    isAuthenticated: AUTH_MOCK_USAGE.guest.useAuthReturn.isAuthenticated,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  });
}

function mockLoggedInMembersOnlyAuth() {
  mockedUseAuth.mockReturnValue({
    customer: AUTH_MOCK_USAGE.loggedInMembersOnly.useAuthReturn.customer as never,
    isAuthenticated: AUTH_MOCK_USAGE.loggedInMembersOnly.useAuthReturn.isAuthenticated,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  });
}

function assertGuestUnavailableCard(container: HTMLElement) {
  expect(within(container).getByTestId('unavailable-promotion-warning')).toHaveTextContent(
    SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
  );
  expect(within(container).queryByText(/PAID|PROCESSING/i)).not.toBeInTheDocument();
  // UI-L-003: single GUEST_REQUIRED string — no stacked / dual soft messaging
  expect(within(container).queryAllByTestId('unavailable-promotion-warning')).toHaveLength(1);
  expect(
    within(container).queryByText(SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER),
  ).not.toBeInTheDocument();

  const loginCta = within(container).getByRole('link', {
    name: SOFT_REASON_FIXTURE_LABELS.GUEST_CTA,
  });
  expect(loginCta).toHaveAttribute('href', '/login');
  expect(loginCta).toHaveAttribute('data-testid', 'unavailable-promotion-login-cta');
}

describe('Promotion logged-in-only Phase 0 fixtures', () => {
  it('returns loggedInOnly / both-keys / newCustomer-only condition shapes', () => {
    expect(parseConditions(guestLoggedInOnlyStorePromotion.conditions)).toEqual(
      buildLoggedInOnlyConditions(),
    );
    expect(parseConditions(guestLoggedInOnlyPlatformPromotion.conditions)).toEqual(
      buildLoggedInOnlyConditions(),
    );
    expect(parseConditions(guestLoggedInOnlyAndNewCustomerStorePromotion.conditions)).toEqual(
      buildLoggedInOnlyAndNewCustomerConditions(),
    );
    expect(parseConditions(guestNewCustomerStorePromotion.conditions)).toEqual(
      buildNewCustomerConditions(),
    );
    expect(AUTH_MOCK_USAGE.guest.useAuthReturn.isAuthenticated).toBe(false);
    expect(AUTH_MOCK_USAGE.loggedInMembersOnly.useAuthReturn.isAuthenticated).toBe(true);
    expect(SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED).toBe(
      'โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก',
    );
    expect(SOFT_REASON_FIXTURE_LABELS.GUEST_CTA).toBe('เข้าสู่ระบบ');
  });

  it('exports MSW override handlers for logged-in-only journeys', () => {
    expect(guestLoggedInOnlyJourneyPromotionHandlers.length).toBeGreaterThan(0);
    expect(guestBothKeysJourneyPromotionHandlers.length).toBeGreaterThan(0);
    expect(loggedInLoggedInOnlyJourneyPromotionHandlers.length).toBeGreaterThan(0);
    expect(guestJourneyPromotionHandlers.length).toBeGreaterThan(0);
    expect(
      createLoggedInOnlyJourneyPromotionHandlers('logged-in-only-guest-required').length,
    ).toBeGreaterThan(0);
  });
});

describe('Promotion logged-in-only Journey 1 — guest soft OR-gate + GUEST_REQUIRED', () => {
  beforeEach(() => {
    mockGuestAuth();
  });

  it('shows loggedInOnly-only store promo as unavailable with exact GUEST_REQUIRED copy and login CTA', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    server.use(...guestLoggedInOnlyJourneyPromotionHandlers);

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
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    // Count parity: gated promo excluded from available list when isGuest
    expect(within(modal).queryByText('ใช้ได้ตอนนี้')).not.toBeInTheDocument();
    expect(within(modal).queryByText(guestLoggedInOnlyStorePromotion.name)).not.toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /ส่วนลด 10%/ })).not.toBeInTheDocument();

    assertGuestUnavailableCard(modal);

    await user.click(within(modal).getByTestId('unavailable-promotion-login-cta'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows loggedInOnly-only platform promo as unavailable with the same shared GUEST_REQUIRED UX', async () => {
    const onConfirm = vi.fn();
    server.use(...guestLoggedInOnlyJourneyPromotionHandlers);

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
      expect(within(modal).getByText('ใช้ไม่ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    expect(within(modal).queryByText('ใช้ได้ตอนนี้')).not.toBeInTheDocument();
    assertGuestUnavailableCard(modal);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('guest + both keys shows a single GUEST_REQUIRED string (UI-L-003)', async () => {
    server.use(...guestBothKeysJourneyPromotionHandlers);

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

    assertGuestUnavailableCard(modal);
    expect(within(modal).queryByText('ใช้ได้ตอนนี้')).not.toBeInTheDocument();
  });

  it('guest + newCustomer-only still shows GUEST_REQUIRED (AC-010 regression)', async () => {
    server.use(...guestJourneyPromotionHandlers);

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

    assertGuestUnavailableCard(modal);
    expect(within(modal).queryByText('ใช้ได้ตอนนี้')).not.toBeInTheDocument();
  });
});

describe('Promotion logged-in-only Journey 2 — logged-in only-loggedInOnly available', () => {
  beforeEach(() => {
    mockLoggedInMembersOnlyAuth();
  });

  it('shows only-loggedInOnly store promo as available without forced new-customer messaging', async () => {
    server.use(...loggedInLoggedInOnlyJourneyPromotionHandlers);

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
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    expect(within(modal).getByRole('button', { name: /ส่วนลด 10%/ })).toBeInTheDocument();
    expect(within(modal).queryByText('ใช้ไม่ได้ตอนนี้')).not.toBeInTheDocument();
    expect(within(modal).queryByTestId('unavailable-promotion-warning')).not.toBeInTheDocument();
    expect(
      within(modal).queryByText(SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER),
    ).not.toBeInTheDocument();
    expect(within(modal).queryByText(/ลูกค้าใหม่/)).not.toBeInTheDocument();
    expect(
      within(modal).queryByText(SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED),
    ).not.toBeInTheDocument();
  });

  it('shows only-loggedInOnly platform promo as available without forced new-customer messaging', async () => {
    server.use(...loggedInLoggedInOnlyJourneyPromotionHandlers);

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
      expect(within(modal).getByText('ใช้ได้ตอนนี้ (1)')).toBeInTheDocument();
    });

    expect(within(modal).getByRole('button', { name: /ส่วนลด ฿50/ })).toBeInTheDocument();
    expect(within(modal).queryByText('ใช้ไม่ได้ตอนนี้')).not.toBeInTheDocument();
    expect(
      within(modal).queryByText(SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER),
    ).not.toBeInTheDocument();
    expect(within(modal).queryByText(/ลูกค้าใหม่/)).not.toBeInTheDocument();
  });

  it('soft GUEST from validatePromotion maps to existing GUEST_REQUIRED constants (AC-018/019)', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    server.use(...createLoggedInOnlyJourneyPromotionHandlers('logged-in-only-guest-required'));

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
    });

    await user.click(within(modal).getByRole('button', { name: /ส่วนลด 10%/ }));
    await user.click(within(modal).getByTestId('store-promotion-confirm-button'));

    await waitFor(() => {
      expect(
        within(modal).getByText(SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED),
      ).toBeInTheDocument();
    });

    expect(
      within(modal).queryByText(SOFT_REASON_FIXTURE_LABELS.NOT_NEW_CUSTOMER),
    ).not.toBeInTheDocument();
    expect(
      within(modal).queryByText('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว'),
    ).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
