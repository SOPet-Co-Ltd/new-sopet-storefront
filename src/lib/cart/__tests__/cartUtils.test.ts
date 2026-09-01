import { describe, expect, it } from 'vitest';
import {
  computeCartItemCount,
  computeCartSubtotal,
  getCartItemCompareAtPrice,
  groupCartItemsByStore,
} from '@/lib/cart/cartUtils';
import { sampleCartItem } from '@/test/mocks/fixtures/cart';

describe('cartUtils', () => {
  it('groups cart items by store and computes subtotal', () => {
    const groups = groupCartItemsByStore([sampleCartItem]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.storeId).toBe(sampleCartItem.productVariant?.product?.storeId);
    expect(groups[0]?.items).toHaveLength(1);
    expect(groups[0]?.subtotal).toBe(1780);
    expect(computeCartSubtotal([sampleCartItem])).toBe(1780);
    expect(computeCartItemCount([sampleCartItem])).toBe(2);
  });

  it('returns honest compare-at only when greater than payable unit', () => {
    expect(getCartItemCompareAtPrice(sampleCartItem)).toBeNull();
    expect(
      getCartItemCompareAtPrice({
        ...sampleCartItem,
        productVariant: sampleCartItem.productVariant
          ? { ...sampleCartItem.productVariant, price: 223.2, compareAtPrice: 279 }
          : null,
      }),
    ).toBe(279);
    expect(
      getCartItemCompareAtPrice({
        ...sampleCartItem,
        productVariant: sampleCartItem.productVariant
          ? { ...sampleCartItem.productVariant, price: 890, compareAtPrice: 890 }
          : null,
      }),
    ).toBeNull();
  });
});
