import { describe, expect, it } from 'vitest';
import {
  categorizeStorePromotions,
  estimatePromotionDiscount,
  formatPromotionDiscountTitle,
  formatPromotionConditionText,
  getUnavailablePromotionCta,
  getUnavailablePromotionReason,
  getUnavailablePromotionWarning,
  hasLoggedInOnlyConditionEnabled,
  isPromotionAvailable,
  mapSoftIneligibilityReason,
  mergeListTimeEligibility,
  parseStorePromotionConditions,
  type PromotionEligibilityBatchItem,
  type PromotionEstimateCartLine,
  type StorePromotion,
} from '@/lib/checkout/storePromotionUtils';
import { sampleStorePromotion } from '@/test/mocks/fixtures/checkout';
import {
  BXGY_PRODUCT_ID,
  bxgyStorePromotion,
  buildBxGyConditions,
  buildLoggedInOnlyConditions,
  fixedAmountClampPromotion,
  guestLoggedInOnlyAndNewCustomerStorePromotion,
  guestLoggedInOnlyPlatformPromotion,
  guestLoggedInOnlyStorePromotion,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  SOFT_REASON_FIXTURE_LABELS,
  stringifyConditions,
} from '@/test/mocks/fixtures/promotion-universal-conditions';

const promotionWithConditions = {
  ...sampleStorePromotion,
  conditions: null as string | null,
};

describe('storePromotionUtils', () => {
  describe('formatPromotionConditionText', () => {
    it('returns null when promotion has no purchase or discount caps', () => {
      expect(
        formatPromotionConditionText(
          {
            ...promotionWithConditions,
            minPurchaseAmount: null,
            maxDiscountAmount: null,
          },
          500,
        ),
      ).toBeNull();
    });

    it('returns min purchase text when min purchase is set', () => {
      expect(
        formatPromotionConditionText(
          {
            ...promotionWithConditions,
            minPurchaseAmount: 200,
            maxDiscountAmount: null,
          },
          500,
        ),
      ).toBe('เมื่อซื้อครบ ฿200.00');
    });
  });

  describe('parseStorePromotionConditions', () => {
    it('returns empty object when conditions missing or invalid', () => {
      expect(parseStorePromotionConditions(null)).toEqual({});
      expect(parseStorePromotionConditions(undefined)).toEqual({});
      expect(parseStorePromotionConditions('{')).toEqual({});
      expect(parseStorePromotionConditions('[]')).toEqual({});
    });

    it('parses newCustomer.enabled from conditions JSON', () => {
      expect(parseStorePromotionConditions(guestNewCustomerStorePromotion.conditions)).toEqual({
        newCustomer: { enabled: true, nDays: 30 },
      });
    });

    it('parses loggedInOnly.enabled === true and ignores false/absent', () => {
      expect(parseStorePromotionConditions(guestLoggedInOnlyStorePromotion.conditions)).toEqual({
        loggedInOnly: { enabled: true },
      });
      expect(
        parseStorePromotionConditions(JSON.stringify({ loggedInOnly: { enabled: false } })),
      ).toEqual({});
      expect(parseStorePromotionConditions(stringifyConditions({}))).toEqual({});
      expect(
        parseStorePromotionConditions(guestLoggedInOnlyAndNewCustomerStorePromotion.conditions),
      ).toEqual({
        loggedInOnly: { enabled: true },
        newCustomer: { enabled: true, nDays: 30 },
      });
    });
  });

  /**
   * Frontend DD Output Comparison — guest OR-gate (UI-L-005) + availablePromotionCount parity.
   * Count = categorizeStorePromotions(...).available.length when isGuest is passed (IP-S4).
   */
  describe('isPromotionAvailable / categorizeStorePromotions (guest OR-gate loggedInOnly)', () => {
    it.each([
      {
        label: 'guest + none',
        promo: { ...promotionWithConditions, conditions: stringifyConditions({}) },
        isGuest: true,
        available: true,
        countIncludes: true,
      },
      {
        label: 'guest + newCustomer only',
        promo: guestNewCustomerStorePromotion,
        isGuest: true,
        available: false,
        countIncludes: false,
      },
      {
        label: 'guest + loggedInOnly only',
        promo: guestLoggedInOnlyStorePromotion,
        isGuest: true,
        available: false,
        countIncludes: false,
      },
      {
        label: 'guest + both keys',
        promo: guestLoggedInOnlyAndNewCustomerStorePromotion,
        isGuest: true,
        available: false,
        countIncludes: false,
      },
      {
        label: 'logged-in + loggedInOnly only',
        promo: guestLoggedInOnlyStorePromotion,
        isGuest: false,
        available: true,
        countIncludes: true,
      },
      {
        label: 'logged-in + newCustomer only',
        promo: guestNewCustomerStorePromotion,
        isGuest: false,
        available: true,
        countIncludes: true,
      },
      {
        label: 'logged-in + both keys',
        promo: guestLoggedInOnlyAndNewCustomerStorePromotion,
        isGuest: false,
        available: true,
        countIncludes: true,
      },
    ])(
      '$label → available=$available; countIncludes=$countIncludes',
      ({ promo, isGuest, available, countIncludes }) => {
        expect(isPromotionAvailable(promo, 500, { isGuest })).toBe(available);

        const { available: availableList } = categorizeStorePromotions([promo], 500, { isGuest });
        expect(availableList.some((p) => p.code === promo.code)).toBe(countIncludes);
      },
    );

    it('hasLoggedInOnlyConditionEnabled is true only when enabled === true', () => {
      expect(hasLoggedInOnlyConditionEnabled(guestLoggedInOnlyStorePromotion)).toBe(true);
      expect(hasLoggedInOnlyConditionEnabled(guestNewCustomerStorePromotion)).toBe(false);
      expect(
        hasLoggedInOnlyConditionEnabled({
          ...promotionWithConditions,
          conditions: JSON.stringify({ loggedInOnly: { enabled: false } }),
        }),
      ).toBe(false);
      expect(
        hasLoggedInOnlyConditionEnabled({
          ...promotionWithConditions,
          conditions: stringifyConditions(buildLoggedInOnlyConditions()),
        }),
      ).toBe(true);
    });

    it('categorizes loggedInOnly promos into unavailable for guests (store + platform)', () => {
      const { available, unavailable } = categorizeStorePromotions(
        [guestLoggedInOnlyStorePromotion, guestLoggedInOnlyPlatformPromotion],
        500,
        { isGuest: true },
      );

      expect(available).toHaveLength(0);
      expect(unavailable.map((p) => p.code)).toEqual(['MEMBERSTORE10', 'MEMBERPLAT50']);
    });

    it('marks guest + newCustomer.enabled as unavailable even when min purchase is met', () => {
      const promo = guestNewCustomerStorePromotion;

      expect(isPromotionAvailable(promo, 999)).toBe(true);
      expect(isPromotionAvailable(promo, 999, { isGuest: true })).toBe(false);
      expect(isPromotionAvailable(promo, 999, { isGuest: false })).toBe(true);
    });

    it('keeps promotions without guest gates available for guests', () => {
      const promo = {
        ...promotionWithConditions,
        conditions: stringifyConditions({}),
      };

      expect(isPromotionAvailable(promo, 100, { isGuest: true })).toBe(true);
    });

    it('categorizes newCustomer-conditioned promos into unavailable for guests (store + platform)', () => {
      const { available, unavailable } = categorizeStorePromotions(
        [guestNewCustomerStorePromotion, guestNewCustomerPlatformPromotion],
        500,
        { isGuest: true },
      );

      expect(available).toHaveLength(0);
      expect(unavailable.map((p) => p.code)).toEqual(['NEWSTORE30', 'NEWPLAT30']);
    });

    it('leaves conditioned promos available when not guest', () => {
      const { available, unavailable } = categorizeStorePromotions(
        [guestNewCustomerStorePromotion, guestLoggedInOnlyStorePromotion],
        500,
        { isGuest: false },
      );

      expect(available).toHaveLength(2);
      expect(unavailable).toHaveLength(0);
    });
  });

  describe('unavailable reason / soft copy (GUEST path)', () => {
    it('maps guest + newCustomer to GUEST_REQUIRED with login CTA copy', () => {
      const reason = getUnavailablePromotionReason(guestNewCustomerStorePromotion, 500, {
        isGuest: true,
      });

      expect(reason).toBe('GUEST_REQUIRED');
      expect(getUnavailablePromotionWarning(reason, guestNewCustomerStorePromotion, 500)).toBe(
        SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
      );
      expect(getUnavailablePromotionCta(reason)).toEqual({
        label: SOFT_REASON_FIXTURE_LABELS.GUEST_CTA,
        href: '/login',
      });
    });

    it('maps guest + loggedInOnly-only to the same GUEST_REQUIRED warning and CTA', () => {
      const reason = getUnavailablePromotionReason(guestLoggedInOnlyStorePromotion, 500, {
        isGuest: true,
      });

      expect(reason).toBe('GUEST_REQUIRED');
      expect(getUnavailablePromotionWarning(reason, guestLoggedInOnlyStorePromotion, 500)).toBe(
        SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
      );
      expect(getUnavailablePromotionCta(reason)).toEqual({
        label: SOFT_REASON_FIXTURE_LABELS.GUEST_CTA,
        href: '/login',
      });
    });

    it('maps guest + both keys to a single GUEST_REQUIRED string (UI-L-003)', () => {
      const reason = getUnavailablePromotionReason(
        guestLoggedInOnlyAndNewCustomerStorePromotion,
        500,
        { isGuest: true },
      );

      expect(reason).toBe('GUEST_REQUIRED');
      expect(
        getUnavailablePromotionWarning(reason, guestLoggedInOnlyAndNewCustomerStorePromotion, 500),
      ).toBe(SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED);
    });

    it('prefers GUEST_REQUIRED over min-purchase when both apply (loggedInOnly)', () => {
      const promo = {
        ...guestLoggedInOnlyStorePromotion,
        minPurchaseAmount: 1000,
      };

      expect(getUnavailablePromotionReason(promo, 100, { isGuest: true })).toBe('GUEST_REQUIRED');
    });

    it('prefers GUEST_REQUIRED over min-purchase when both apply (newCustomer)', () => {
      const promo = {
        ...guestNewCustomerStorePromotion,
        minPurchaseAmount: 1000,
      };

      expect(getUnavailablePromotionReason(promo, 100, { isGuest: true })).toBe('GUEST_REQUIRED');
    });

    it('maps soft ORDER_HISTORY / ACCOUNT_AGE collapse and BXGY freeN=0', () => {
      expect(mapSoftIneligibilityReason('ORDER_HISTORY')).toBe('NOT_NEW_CUSTOMER');
      expect(mapSoftIneligibilityReason('ACCOUNT_AGE')).toBe('NOT_NEW_CUSTOMER');
      expect(mapSoftIneligibilityReason('INSUFFICIENT_QTY')).toBe('BXGY_QTY');
      expect(mapSoftIneligibilityReason('MISSING_LINES')).toBe('BXGY_QTY');

      const reason = getUnavailablePromotionReason(bxgyStorePromotion, 500, {
        isGuest: false,
        cartLines: [{ productId: BXGY_PRODUCT_ID, quantity: 1, unitPrice: 100 }],
      });
      expect(reason).toBe('BXGY_QTY');
      expect(getUnavailablePromotionWarning(reason, bxgyStorePromotion, 500)).toBe(
        SOFT_REASON_FIXTURE_LABELS.BXGY_QTY,
      );
      expect(getUnavailablePromotionCta(reason)).toEqual({
        label: 'ช้อปเพิ่ม',
        href: '/cart',
      });
    });

    it('Conflict-001: maps PROMOTION_MIN_PURCHASE → MIN_PURCHASE (not UNKNOWN)', () => {
      expect(mapSoftIneligibilityReason('PROMOTION_MIN_PURCHASE')).toBe('MIN_PURCHASE');
      expect(mapSoftIneligibilityReason('PROMOTION_MIN_PURCHASE')).not.toBe('UNKNOWN');
      expect(getUnavailablePromotionCta('MIN_PURCHASE')).toEqual({
        label: 'ช้อปเพิ่ม',
        href: '/cart',
      });
    });

    it('maps Soft reason → UI Spec copy table verbatim (Rule H)', () => {
      expect(mapSoftIneligibilityReason('GUEST')).toBe('GUEST_REQUIRED');
      expect(mapSoftIneligibilityReason('ORDER_HISTORY')).toBe('NOT_NEW_CUSTOMER');
      expect(mapSoftIneligibilityReason('ACCOUNT_AGE')).toBe('NOT_NEW_CUSTOMER');
      expect(mapSoftIneligibilityReason('INSUFFICIENT_QTY')).toBe('BXGY_QTY');
      expect(mapSoftIneligibilityReason('MISSING_LINES')).toBe('BXGY_QTY');
      expect(mapSoftIneligibilityReason('PROMOTION_MIN_PURCHASE')).toBe('MIN_PURCHASE');
      expect(mapSoftIneligibilityReason('INVALID_PROMOTION')).toBe('UNKNOWN');
      expect(mapSoftIneligibilityReason(null)).toBe('UNKNOWN');
    });
  });

  /**
   * Frontend DD Decision 6 Early Verification Point — mergeListTimeEligibility (a)–(e)
   * before either checkout modal wires batch / softReasonOverride / AC-051 banner.
   */
  describe('mergeListTimeEligibility Early Verification (a)–(e)', () => {
    const availablePromo: StorePromotion = {
      ...promotionWithConditions,
      id: 'promo-available',
      code: 'AVAIL10',
      minPurchaseAmount: null,
    };
    const minPurchasePromo: StorePromotion = {
      ...promotionWithConditions,
      id: 'promo-min',
      code: 'MIN200',
      minPurchaseAmount: 200,
    };
    const newCustomerPromo: StorePromotion = {
      ...guestNewCustomerStorePromotion,
      id: 'promo-new',
      code: 'NEW30',
    };
    const catalog = [availablePromo, minPurchasePromo, newCustomerPromo];
    const subtotalBelowMin = 100;

    it('(a) client-local-only when batchStatus !== success', () => {
      const client = categorizeStorePromotions(catalog, subtotalBelowMin, { isGuest: false });
      const softBatch: PromotionEligibilityBatchItem[] = [
        {
          id: availablePromo.id,
          code: availablePromo.code,
          eligible: false,
          ineligibilityReason: 'ORDER_HISTORY',
        },
      ];

      for (const batchStatus of ['idle', 'loading', 'error'] as const) {
        const merged = mergeListTimeEligibility(
          catalog,
          subtotalBelowMin,
          { isGuest: false },
          softBatch,
          batchStatus,
        );

        expect(merged.available.map((p) => p.id)).toEqual(client.available.map((p) => p.id));
        expect(merged.unavailable.map((e) => e.promotion.id)).toEqual(
          client.unavailable.map((p) => p.id),
        );
        expect(merged.unavailable.every((e) => e.softReasonOverride === undefined)).toBe(true);
        expect(merged.softEligibilityError).toBe(batchStatus === 'error');
      }

      const nullItems = mergeListTimeEligibility(
        catalog,
        subtotalBelowMin,
        { isGuest: false },
        null,
        'success',
      );
      expect(nullItems.available.map((p) => p.id)).toEqual(client.available.map((p) => p.id));
      expect(nullItems.softEligibilityError).toBe(false);
    });

    it('(b) eligible===false → unavailable with mapped softReasonOverride or UNKNOWN when absent', () => {
      const withReason = mergeListTimeEligibility(
        [availablePromo],
        500,
        { isGuest: false },
        [
          {
            id: availablePromo.id,
            code: availablePromo.code,
            eligible: false,
            ineligibilityReason: 'ORDER_HISTORY',
          },
        ],
        'success',
      );
      expect(withReason.available).toHaveLength(0);
      expect(withReason.unavailable).toEqual([
        {
          promotion: availablePromo,
          softReasonOverride: 'NOT_NEW_CUSTOMER',
        },
      ]);

      const withoutReason = mergeListTimeEligibility(
        [availablePromo],
        500,
        { isGuest: false },
        [{ id: availablePromo.id, code: availablePromo.code, eligible: false }],
        'success',
      );
      expect(withoutReason.available).toHaveLength(0);
      expect(withoutReason.unavailable[0]?.softReasonOverride).toBe('UNKNOWN');
    });

    it('(c) batch soft union + override supersedes client reason', () => {
      const merged = mergeListTimeEligibility(
        catalog,
        subtotalBelowMin,
        { isGuest: false },
        [
          {
            id: availablePromo.id,
            code: availablePromo.code,
            eligible: false,
            ineligibilityReason: 'ACCOUNT_AGE',
          },
          {
            id: minPurchasePromo.id,
            code: minPurchasePromo.code,
            eligible: false,
            ineligibilityReason: 'ORDER_HISTORY',
          },
        ],
        'success',
      );

      const unavailableIds = merged.unavailable.map((e) => e.promotion.id);
      expect(unavailableIds).toEqual(
        expect.arrayContaining([availablePromo.id, minPurchasePromo.id]),
      );
      expect(new Set(unavailableIds).size).toBe(unavailableIds.length);

      const minEntry = merged.unavailable.find((e) => e.promotion.id === minPurchasePromo.id);
      expect(minEntry?.softReasonOverride).toBe('NOT_NEW_CUSTOMER');
      expect(minEntry?.softReasonOverride).not.toBe('MIN_PURCHASE');

      expect(merged.available.map((p) => p.id)).not.toContain(availablePromo.id);
      expect(merged.softEligibilityError).toBe(false);
    });

    it('(d) batchStatus===error → softEligibilityError=true; client-local retained (never unlock)', () => {
      const client = categorizeStorePromotions(catalog, subtotalBelowMin, { isGuest: false });
      const merged = mergeListTimeEligibility(
        catalog,
        subtotalBelowMin,
        { isGuest: false },
        [
          {
            id: minPurchasePromo.id,
            code: minPurchasePromo.code,
            eligible: true,
            ineligibilityReason: null,
          },
        ],
        'error',
      );

      expect(merged.softEligibilityError).toBe(true);
      expect(merged.unavailable.map((e) => e.promotion.id)).toEqual(
        client.unavailable.map((p) => p.id),
      );
      expect(merged.available.map((p) => p.id)).toEqual(client.available.map((p) => p.id));
      expect(merged.unavailable.some((e) => e.promotion.id === minPurchasePromo.id)).toBe(true);
    });

    it('(e) Conflict-001: batch PROMOTION_MIN_PURCHASE → softReasonOverride MIN_PURCHASE', () => {
      const merged = mergeListTimeEligibility(
        [availablePromo],
        500,
        { isGuest: false },
        [
          {
            id: availablePromo.id,
            code: availablePromo.code,
            eligible: false,
            ineligibilityReason: 'PROMOTION_MIN_PURCHASE',
          },
        ],
        'success',
      );

      expect(merged.unavailable).toHaveLength(1);
      expect(merged.unavailable[0]?.softReasonOverride).toBe('MIN_PURCHASE');
      expect(merged.unavailable[0]?.softReasonOverride).not.toBe('UNKNOWN');
      expect(getUnavailablePromotionCta(merged.unavailable[0]!.softReasonOverride!)).toEqual({
        label: 'ช้อปเพิ่ม',
        href: '/cart',
      });
    });

    it('never moves batch soft-ineligible into available even when reason absent', () => {
      const merged = mergeListTimeEligibility(
        [availablePromo],
        500,
        { isGuest: false },
        [{ id: availablePromo.id, eligible: false, ineligibilityReason: null }],
        'success',
      );
      expect(merged.available).toHaveLength(0);
      expect(merged.unavailable[0]?.softReasonOverride).toBe('UNKNOWN');
    });
  });

  /**
   * UI-D-004 / AC-037–038 — client estimate mirrors Backend Rule A/B for coupon preview.
   * estimatePromotionDiscount is for modal preview only — NOT the source for
   * CheckoutOrderItemRow free-unit badges (those use validatePromotion.freeUnits; Gate A / task-09).
   */
  describe('estimatePromotionDiscount Rule A/B + fixed_amount clamp', () => {
    const linesForQ = (
      rows: Array<{ quantity: number; unitPrice: number; variantId?: string }>,
    ): PromotionEstimateCartLine[] =>
      rows.map((row, index) => ({
        productId: BXGY_PRODUCT_ID,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        variantId: row.variantId ?? `v-${index}`,
      }));

    it.each([
      { Q: 2, freeN: 0, expectedDiscount: 0 },
      { Q: 3, freeN: 1, expectedDiscount: 100 },
      { Q: 5, freeN: 1, expectedDiscount: 100 },
      { Q: 6, freeN: 2, expectedDiscount: 200 },
    ])(
      'Rule A: Buy 2 Get 1 for Q=$Q → freeN=$freeN preview=$expectedDiscount (unitPrice 100)',
      ({ Q, expectedDiscount }) => {
        const discount = estimatePromotionDiscount(
          bxgyStorePromotion,
          1000,
          linesForQ([{ quantity: Q, unitPrice: 100 }]),
        );
        expect(discount).toBe(expectedDiscount);
      },
    );

    it('Rule B: preview equals sum of cheapest freeN unit prices (ignores foreign productId)', () => {
      // Q=6 → freeN=2; multiset 50,80,100,110,120,130 → cheapest two = 50+80 = 130
      const lines: PromotionEstimateCartLine[] = [
        { productId: BXGY_PRODUCT_ID, variantId: 'a', quantity: 1, unitPrice: 50 },
        { productId: BXGY_PRODUCT_ID, variantId: 'b', quantity: 1, unitPrice: 80 },
        { productId: BXGY_PRODUCT_ID, variantId: 'c', quantity: 1, unitPrice: 100 },
        { productId: BXGY_PRODUCT_ID, variantId: 'd', quantity: 1, unitPrice: 110 },
        { productId: BXGY_PRODUCT_ID, variantId: 'e', quantity: 1, unitPrice: 120 },
        { productId: BXGY_PRODUCT_ID, variantId: 'f', quantity: 1, unitPrice: 130 },
        { productId: 'foreign', variantId: 'x', quantity: 10, unitPrice: 1 },
      ];

      expect(estimatePromotionDiscount(bxgyStorePromotion, 1000, lines)).toBe(130);
    });

    it('freeN=0 with lines → ฿0; missing cartLines → ฿0', () => {
      expect(
        estimatePromotionDiscount(
          bxgyStorePromotion,
          1000,
          linesForQ([{ quantity: 2, unitPrice: 100 }]),
        ),
      ).toBe(0);
      expect(estimatePromotionDiscount(bxgyStorePromotion, 1000)).toBe(0);
      expect(estimatePromotionDiscount(bxgyStorePromotion, 1000, undefined)).toBe(0);
    });

    it('fixed_amount Rule C: preview = min(V, eligibleBase) after maxDiscount', () => {
      expect(estimatePromotionDiscount(fixedAmountClampPromotion, 80)).toBe(80);
      expect(estimatePromotionDiscount(fixedAmountClampPromotion, 150)).toBe(100);

      const capped = {
        ...fixedAmountClampPromotion,
        discountValue: 100,
        maxDiscountAmount: 40,
      };
      expect(estimatePromotionDiscount(capped, 150)).toBe(40);
    });

    it('formatPromotionDiscountTitle for buy_x_get_y uses ซื้อ {X} แถม {Y}', () => {
      expect(formatPromotionDiscountTitle(bxgyStorePromotion)).toBe('ซื้อ 2 แถม 1');
      expect(
        formatPromotionDiscountTitle({
          ...bxgyStorePromotion,
          conditions: stringifyConditions(buildBxGyConditions({ buyQuantity: 3, getQuantity: 2 })),
        }),
      ).toBe('ซื้อ 3 แถม 2');
    });

    it('marks BxGy freeN=0 unavailable when cartLines provided (preview path)', () => {
      const insufficient = linesForQ([{ quantity: 2, unitPrice: 100 }]);
      expect(isPromotionAvailable(bxgyStorePromotion, 1000, { cartLines: insufficient })).toBe(
        false,
      );

      const sufficient = linesForQ([{ quantity: 3, unitPrice: 100 }]);
      expect(isPromotionAvailable(bxgyStorePromotion, 1000, { cartLines: sufficient })).toBe(true);
    });
  });
});
