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

  it('does not double-count platform + store FREE_SHIPPING against one shipping fee', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 856,
      itemCount: 4,
      storeIds: ['store-1'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-1', shippingFee: 50 },
      },
      storePromotionsByStoreId: {
        'store-1': {
          code: 'ATVNDFREESHIP',
          name: 'Vendor free shipping',
          discountAmount: 50,
          type: 'free_shipping',
        },
      },
      platformPromotionDiscount: 50,
      platformPromotionType: 'free_shipping',
    });

    expect(totals.platformPromotionDiscount).toBe(50);
    expect(totals.storeDiscountTotal).toBe(0);
    expect(totals.totalDiscount).toBe(50);
    expect(totals.shippingFeeTotal).toBe(50);
    expect(totals.finalPrice).toBe(856);
  });

  it('still stacks merchandise store discount with platform free shipping', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 856,
      itemCount: 4,
      storeIds: ['store-1'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-1', shippingFee: 50 },
      },
      storePromotionsByStoreId: {
        'store-1': {
          code: 'STORE10',
          name: 'Store 10%',
          discountAmount: 85.6,
          type: 'percentage',
        },
      },
      platformPromotionDiscount: 50,
      platformPromotionType: 'free_shipping',
    });

    expect(totals.platformPromotionDiscount).toBe(50);
    expect(totals.storeDiscountTotal).toBe(85.6);
    expect(totals.storeDiscountByStoreId['store-1']).toBe(85.6);
    expect(totals.totalDiscount).toBe(135.6);
    expect(totals.finalPrice).toBe(770.4);
  });

  it('does not let a stale store shipping discount leak into another store fee', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 500,
      itemCount: 2,
      storeIds: ['store-a', 'store-b'],
      shippingByStoreId: {
        'store-a': { shippingOptionId: 'ship-cheap', shippingFee: 30 },
        'store-b': { shippingOptionId: 'ship-1', shippingFee: 40 },
      },
      storePromotionsByStoreId: {
        'store-a': {
          code: 'FREESHIP',
          name: 'Free shipping',
          discountAmount: 50,
          type: 'free_shipping',
        },
      },
      platformPromotionDiscount: 0,
    });

    expect(totals.storeDiscountByStoreId['store-a']).toBe(30);
    expect(totals.storeDiscountTotal).toBe(30);
    expect(totals.shippingFeeTotal).toBe(70);
    expect(totals.finalPrice).toBe(540);
  });

  it('recomputes free shipping discount when store fee increases after apply', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 200,
      itemCount: 1,
      storeIds: ['store-1'],
      shippingByStoreId: {
        'store-1': { shippingOptionId: 'ship-express', shippingFee: 80 },
      },
      storePromotionsByStoreId: {
        'store-1': {
          code: 'FREESHIP',
          name: 'Free shipping',
          discountAmount: 50,
          type: 'free_shipping',
        },
      },
      platformPromotionDiscount: 0,
    });

    expect(totals.storeDiscountByStoreId['store-1']).toBe(80);
    expect(totals.storeDiscountTotal).toBe(80);
    expect(totals.finalPrice).toBe(200);
  });

  it('caps fixed shipping discount to the store own fee in multi-store checkout', () => {
    const totals = calculateCheckoutTotals({
      subtotal: 400,
      itemCount: 2,
      storeIds: ['store-a', 'store-b'],
      shippingByStoreId: {
        'store-a': { shippingOptionId: 'ship-1', shippingFee: 20 },
        'store-b': { shippingOptionId: 'ship-1', shippingFee: 45 },
      },
      storePromotionsByStoreId: {
        'store-a': {
          code: 'SHIP30',
          name: 'Fixed ship discount',
          discountAmount: 30,
          type: 'fixed_shipping_discount',
        },
      },
      platformPromotionDiscount: 0,
    });

    expect(totals.storeDiscountByStoreId['store-a']).toBe(20);
    expect(totals.storeDiscountTotal).toBe(20);
    expect(totals.finalPrice).toBe(445);
  });
});
