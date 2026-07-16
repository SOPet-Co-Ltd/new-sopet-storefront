// Promotion Universal Conditions fixture-e2e Test — Storefront checkout
// Design Doc: promotion-universal-conditions-frontend-design.md
// UI Spec: promotion-universal-conditions-ui-spec.md
// PRD: promotion-universal-conditions-prd.md (AC-003, AC-004, AC-018, AC-027, AC-033, AC-036, AC-037)
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 2/3 (reserved + slot 3), service-e2e 0/2
//
// Implement target: this file (RTL+MSW fixture-e2e) and/or Playwright if promo E2E harness exists.
// Phase 0: fixture helpers + MSW stubs importable; journeys remain comment-driven until Phase 2/4.
//
// Feature fixture-e2e budget (3/3 total): this file holds reserved guest journey + BxGy/fixed
// journey; admin create journey is in sopet-admin/e2e/promotion-universal-conditions.fixture.e2e.skeleton.ts
//
// Auth mock usage (see AUTH_MOCK_USAGE in fixtures/promotion-universal-conditions.ts):
// - Guest Journey 1: vi.mock useAuth → isAuthenticated: false
// - Logged-in Journey 2: vi.mock useAuth → isAuthenticated: true + customer
// MSW: server.use(...guestJourneyPromotionHandlers) or createBxGyJourneyPromotionHandlers()
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): Guest sees new-customer promo unavailable + login CTA
// ---------------------------------------------------------------------------
//
// Journey AC: "Guest at checkout opens store/platform promo modal → conditioned promo appears
// unavailable with soft login messaging → cannot apply → login CTA navigates auth
// (AC-003, AC-004, AC-033, UI-D-003) — S-Checkout → S-Checkout-*-Modal → LoginHint"
// ROI: 98 (BV:10 × Freq:9 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step journey)
// Behavior: Guest session + active promo with conditions.newCustomer.enabled →
// UnavailableStorePromotionCard with GUEST_REQUIRED copy + เข้าสู่ระบบ CTA; apply blocked
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW activeStorePromotions / activePlatformPromotions
// with conditions JSON; useAuth guest; CheckoutStorePromotionModal / CheckoutPlatformPromotionModal
// @complexity: high
// Primary failure mode: guest can select/apply conditioned promo; soft copy missing or exposes
// paid-path status names; CTA absent; available list includes conditioned promo
// Proof obligation: MSW fixtures return platform and store promos with
// newCustomer:{enabled:true,nDays:30}; mock useAuth as guest; open store then platform promo
// modals from checkout; assert UnavailableStorePromotionCard warning
// โปรโมชันนี้สำหรับสมาชิกเท่านั้น… and CTA เข้าสู่ระบบ; assert promo absent from selectable
// available list; tap CTA → auth navigation (or href). Shared storePromotionUtils only — no
// platformPromotionUtils estimate fork. Boundary: guest + conditioned availability path
// Verification points / expected results / pass criteria:
// - Conditioned promo in unavailable list for guest (store and platform modals)
// - Warning copy matches UI Spec GUEST_REQUIRED (no PAID/PROCESSING status names)
// - Login CTA labeled เข้าสู่ระบบ and triggers auth navigation
// - Selecting/applying conditioned code as guest does not mark promo applied
// - Both modals use shared storePromotionUtils categorize/availability
//
// ---------------------------------------------------------------------------
// Journey 2: Eligible BxGy free-unit visibility + fixed_amount clamp preview
// ---------------------------------------------------------------------------
//
// Journey AC: "Logged-in eligible customer at checkout → fixed_amount preview = min(V,B);
// BxGy with freeN>0 shows ซื้อ X แถม Y preview ≠ ฿0 and free-unit indicator after validate
// freeUnits; soft INSUFFICIENT_QTY/MISSING_LINES map to BXGY_QTY (AC-018, AC-027, AC-033,
// AC-036, AC-037, UI-D-004)"
// ROI: 72 (BV:9 × Freq:7 + Legal:0 + Defect:9)
// Behavior: Auth customer + cart lines of P → coupon estimate Rule A/B → validatePromotion MSW
// returns freeUnits → CheckoutOrderLineFreeUnitIndicator visible; fixed_amount V>B clamps
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW validatePromotion with lines/freeUnits/
// ineligibilityReason; checkout cart fixtures with multi-variant product P
// @complexity: high
// Primary failure mode: BxGy preview stays ฿0 when freeN>0; free-unit badge driven from local
// estimate instead of validatePromotion.freeUnits; fixed_amount preview exceeds eligible base;
// soft BXGY_QTY treated as hard invalid-code toast
// Proof obligation: logged-in auth mock; cart Q=3 of P for Buy2Get1; assert coupon title
// ซื้อ 2 แถม 1 and estimate > 0; MSW validatePromotion returns freeUnits=1 and discountAmount;
// assert แถมฟรี indicator text on line (not color-only); fixed_amount V=100 B=60 preview ฿60;
// MSW soft INSUFFICIENT_QTY → Unavailable card BXGY_QTY copy without invalid-code hard toast.
// Gate: free-unit line badges only after validate freeUnits (Design Doc Gate A). Boundary:
// soft reason collapse vs hard GraphQL error UX
// Verification points / expected results / pass criteria:
// - fixed_amount preview === min(V, eligibleBase)
// - BxGy freeN>0: title ซื้อ {X} แถม {Y}; preview equals sum of cheapest freeN unit prices
// - After validate freeUnits>0: แถมฟรี / รวมแถมฟรี {n} ชิ้น visible with text (not color alone)
// - Soft INSUFFICIENT_QTY / MISSING_LINES → BXGY_QTY customer copy; no hard invalid-code toast
// - validatePromotion request includes cart lines (productId, quantity, unitPrice)

import { describe, expect, it } from 'vitest';
import {
  AUTH_MOCK_USAGE,
  BXGY_PRODUCT_ID,
  FIXED_AMOUNT_ELIGIBLE_BASE,
  NEW_CUSTOMER_N_DAYS,
  SOFT_REASON_FIXTURE_LABELS,
  bxgyCartLines,
  bxgyStorePromotion,
  buildBxGyConditions,
  buildNewCustomerConditions,
  fixedAmountClampPromotion,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  parseConditions,
  stringifyConditions,
  validatePromotionBxGyEligible,
  validatePromotionBxGyInsufficientQty,
} from '@/test/mocks/fixtures/promotion-universal-conditions';
import {
  createBxGyJourneyPromotionHandlers,
  guestJourneyPromotionHandlers,
  promotionUniversalConditionsHandlers,
} from '@/test/mocks/promotion-universal-conditions.handlers';

describe('Promotion universal conditions Phase 0 fixtures', () => {
  it('returns conditions JSON with newCustomer keys for guest journey promos', () => {
    const storeConditions = parseConditions(guestNewCustomerStorePromotion.conditions);
    const platformConditions = parseConditions(guestNewCustomerPlatformPromotion.conditions);

    expect(storeConditions.newCustomer).toEqual({
      enabled: true,
      nDays: NEW_CUSTOMER_N_DAYS,
    });
    expect(platformConditions.newCustomer).toEqual({
      enabled: true,
      nDays: NEW_CUSTOMER_N_DAYS,
    });
    expect(AUTH_MOCK_USAGE.guest.useAuthReturn.isAuthenticated).toBe(false);
    expect(SOFT_REASON_FIXTURE_LABELS.GUEST_CTA).toBe('เข้าสู่ระบบ');
  });

  it('returns BxGy conditions with productId / buyQuantity / getQuantity', () => {
    const conditions = parseConditions(bxgyStorePromotion.conditions);
    const expected = {
      ...buildBxGyConditions(),
      ...buildNewCustomerConditions(),
    };

    expect(conditions.productId).toBe(BXGY_PRODUCT_ID);
    expect(conditions.buyQuantity).toBe(2);
    expect(conditions.getQuantity).toBe(1);
    expect(conditions.newCustomer).toEqual(expected.newCustomer);
    expect(JSON.parse(stringifyConditions(expected))).toMatchObject({
      productId: BXGY_PRODUCT_ID,
      buyQuantity: 2,
      getQuantity: 1,
    });
  });

  it('supplies validatePromotion freeUnits and soft INSUFFICIENT_QTY stubs', () => {
    expect(validatePromotionBxGyEligible.freeUnits).toBe(1);
    expect(validatePromotionBxGyEligible.discountAmount).toBeGreaterThan(0);
    expect(validatePromotionBxGyInsufficientQty.ineligibilityReason).toBe('INSUFFICIENT_QTY');
    expect(validatePromotionBxGyInsufficientQty.discountAmount).toBe(0);
    expect(fixedAmountClampPromotion.discountValue).toBe(100);
    expect(Math.min(fixedAmountClampPromotion.discountValue, FIXED_AMOUNT_ELIGIBLE_BASE)).toBe(60);
    expect(bxgyCartLines.reduce((sum, line) => sum + line.quantity, 0)).toBe(3);
  });

  it('exports MSW override handlers for guest and BxGy journeys', () => {
    expect(guestJourneyPromotionHandlers.length).toBeGreaterThan(0);
    expect(createBxGyJourneyPromotionHandlers('bxgy-eligible').length).toBeGreaterThan(0);
    expect(promotionUniversalConditionsHandlers).toBe(guestJourneyPromotionHandlers);
    expect(AUTH_MOCK_USAGE.loggedIn.useAuthReturn.isAuthenticated).toBe(true);
  });
});
