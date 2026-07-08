import { describe, expect, it } from 'vitest';
import { calculateCheckoutTotals } from '../checkoutTotalsUtils';

describe('calculateCheckoutTotals', () => {
  it('sums subtotal, shipping, and discounts into final price', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 597,
      itemCount: 3,
      storeIds: ['store-1'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-1', shippingFee: 50 },
      },
      storePromotionsByStoreId: {
        'store-1': { code: 'STORE10', name: 'Store 10%', discountAmount: 20 },
      },
      platformPromotionDiscount: 59.7,
    });

    expect(totals.storeDiscountTotal).toBe(20);
    expect(totals.platformPromotionDiscount).toBe(59.7);
    expect(totals.totalDiscount).toBe(79.7);
    expect(totals.shippingFeeTotal).toBe(50);
    expect(totals.finalPrice).toBe(567.3);
    expect(totals.savingsTotal).toBe(79.7);
    expect(totals.isShippingComplete).toBe(true);
  });

  it('treats missing shipping fee as zero', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 100,
      itemCount: 1,
      storeIds: ['store-1'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-1' },
      },
      storePromotionsByStoreId: {},
      platformPromotionDiscount: 0,
    });

    expect(totals.shippingFeeTotal).toBe(0);
    expect(totals.isShippingComplete).toBe(true);
    expect(totals.finalPrice).toBe(100);
  });

  it('marks shipping incomplete when a store has no selection', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 200,
      itemCount: 2,
      storeIds: ['store-1', 'store-2'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-1', shippingFee: 30 },
      },
      storePromotionsByStoreId: {},
      platformPromotionDiscount: 0,
    });

    expect(totals.shippingFeeTotal).toBe(30);
    expect(totals.isShippingComplete).toBe(false);
    expect(totals.finalPrice).toBe(230);
  });

  it('never returns a negative final price', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 50,
      itemCount: 1,
      storeIds: ['store-1'],
      shippingByStoreId: {},
      storePromotionsByStoreId: {
        'store-1': { code: 'BIG', name: 'Big', discountAmount: 100 },
      },
      platformPromotionDiscount: 50,
    });

    expect(totals.finalPrice).toBe(0);
  });
});
