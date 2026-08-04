import { describe, expect, it } from 'vitest';
import { cartLineToAnalyticsItem, orderLineToAnalyticsItem, sumItemValue } from './items';

describe('cartLineToAnalyticsItem', () => {
  it('maps cart line product fields', () => {
    expect(
      cartLineToAnalyticsItem({
        quantity: 2,
        variantId: 'var-1',
        productVariant: {
          price: 150,
          product: {
            id: 'prod-1',
            name: 'Dog Food',
            store: { name: 'Pet Shop' },
          },
        },
      }),
    ).toEqual({
      item_id: 'prod-1',
      item_name: 'Dog Food',
      item_brand: 'Pet Shop',
      item_variant: 'var-1',
      price: 150,
      quantity: 2,
    });
  });

  it('falls back to variantId when product is missing', () => {
    expect(
      cartLineToAnalyticsItem({
        quantity: 1,
        variantId: 'var-only',
      }),
    ).toMatchObject({
      item_id: 'var-only',
      item_name: 'var-only',
      item_variant: 'var-only',
      quantity: 1,
    });
  });
});

describe('orderLineToAnalyticsItem', () => {
  it('maps order confirmation line fields', () => {
    expect(
      orderLineToAnalyticsItem({
        productId: 'prod-1',
        variantId: 'var-1',
        productName: 'Cat Litter',
        unitPrice: 99,
        quantity: 3,
      }),
    ).toEqual({
      item_id: 'prod-1',
      item_name: 'Cat Litter',
      item_variant: 'var-1',
      price: 99,
      quantity: 3,
    });
  });
});

describe('sumItemValue', () => {
  it('sums price × quantity', () => {
    expect(
      sumItemValue([
        { item_id: 'a', item_name: 'A', price: 10, quantity: 2 },
        { item_id: 'b', item_name: 'B', price: 5, quantity: 1 },
      ]),
    ).toBe(25);
  });
});
