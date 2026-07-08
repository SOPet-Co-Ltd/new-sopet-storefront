import { describe, expect, it } from 'vitest';
import { formatPromotionConditionText } from '@/lib/checkout/storePromotionUtils';
import { sampleStorePromotion } from '@/test/mocks/fixtures/checkout';

describe('storePromotionUtils', () => {
  describe('formatPromotionConditionText', () => {
    it('returns null when promotion has no purchase or discount caps', () => {
      expect(
        formatPromotionConditionText(
          {
            ...sampleStorePromotion,
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
            ...sampleStorePromotion,
            minPurchaseAmount: 200,
            maxDiscountAmount: null,
          },
          500,
        ),
      ).toBe('เมื่อซื้อครบ ฿200.00');
    });
  });
});
