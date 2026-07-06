import { describe, expect, it } from 'vitest';
import {
  computeCartItemCount,
  computeCartSubtotal,
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
});
