import { describe, expect, it } from 'vitest';
import {
  categorizeStorePromotions,
  formatPromotionConditionText,
  getUnavailablePromotionCta,
  getUnavailablePromotionReason,
  getUnavailablePromotionWarning,
  isPromotionAvailable,
  parseStorePromotionConditions,
} from '@/lib/checkout/storePromotionUtils';
import { sampleStorePromotion } from '@/test/mocks/fixtures/checkout';
import {
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
  });

  describe('isPromotionAvailable / categorizeStorePromotions (guest + newCustomer)', () => {
    it('marks guest + newCustomer.enabled as unavailable even when min purchase is met', () => {
      const promo = guestNewCustomerStorePromotion;

      expect(isPromotionAvailable(promo, 999)).toBe(true);
      expect(isPromotionAvailable(promo, 999, { isGuest: true })).toBe(false);
      expect(isPromotionAvailable(promo, 999, { isGuest: false })).toBe(true);
    });

    it('keeps promotions without newCustomer.enabled available for guests', () => {
      const promo = {
        ...promotionWithConditions,
        conditions: stringifyConditions({}),
      };

      expect(isPromotionAvailable(promo, 100, { isGuest: true })).toBe(true);
    });

    it('categorizes conditioned promos into unavailable for guests (store + platform shapes)', () => {
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
        [guestNewCustomerStorePromotion],
        500,
        { isGuest: false },
      );

      expect(available).toHaveLength(1);
      expect(unavailable).toHaveLength(0);
    });
  });

  describe('unavailable reason / soft copy (GUEST path)', () => {
    it('maps guest + conditioned to GUEST_REQUIRED with login CTA copy', () => {
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

    it('prefers GUEST_REQUIRED over min-purchase when both apply', () => {
      const promo = {
        ...guestNewCustomerStorePromotion,
        minPurchaseAmount: 1000,
      };

      expect(getUnavailablePromotionReason(promo, 100, { isGuest: true })).toBe('GUEST_REQUIRED');
    });

    it('uses MIN_PURCHASE with shop-more CTA when only min purchase blocks', () => {
      const promo = {
        ...promotionWithConditions,
        minPurchaseAmount: 500,
        conditions: null,
      };

      const reason = getUnavailablePromotionReason(promo, 100, { isGuest: true });
      expect(reason).toBe('MIN_PURCHASE');
      expect(getUnavailablePromotionCta(reason)).toEqual({
        label: 'ช้อปเพิ่ม',
        href: '/cart',
      });
    });
  });
});
