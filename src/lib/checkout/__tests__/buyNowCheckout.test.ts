import { afterEach, describe, expect, it } from 'vitest';
import {
  BUY_NOW_ITEM_ID_PREFIX,
  BUY_NOW_STORAGE_KEY,
  buildBuyNowCheckoutPayload,
  clearBuyNowCheckout,
  getBuyNowCheckout,
  isBuyNowCartItemId,
  setBuyNowCheckout,
  toBuyNowCartItem,
  type BuyNowCheckoutPayload,
} from '@/lib/checkout/buyNowCheckout';
import type { ProductDetail } from '@/lib/hooks/useProduct';

const samplePayload: BuyNowCheckoutPayload = {
  productId: 'prod-1',
  variantId: 'var-1',
  quantity: 2,
  price: 199,
  compareAtPrice: null,
  productName: 'Kong Classic',
  productSlug: 'kong-classic',
  thumbnailUrl: 'https://example.com/kong.jpg',
  storeId: 'store-1',
  storeName: 'Pet Shop',
  storeSlug: 'pet-shop',
  sku: 'KONG-M',
  stockQuantity: 10,
  optionsJson: '{"size":"M"}',
};

afterEach(() => {
  clearBuyNowCheckout();
});

describe('buyNowCheckout', () => {
  it('stores and reads a buy-now payload from sessionStorage', () => {
    setBuyNowCheckout(samplePayload);

    expect(window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY)).toBeTruthy();
    expect(getBuyNowCheckout()).toEqual(samplePayload);
  });

  it('clears buy-now payload', () => {
    setBuyNowCheckout(samplePayload);
    clearBuyNowCheckout();

    expect(getBuyNowCheckout()).toBeNull();
    expect(window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY)).toBeNull();
  });

  it('builds a synthetic cart line with buy-now id prefix', () => {
    const item = toBuyNowCartItem(samplePayload);

    expect(item.id).toBe(`${BUY_NOW_ITEM_ID_PREFIX}var-1`);
    expect(isBuyNowCartItemId(item.id)).toBe(true);
    expect(item.quantity).toBe(2);
    expect(item.productVariant?.price).toBe(199);
    expect(item.productVariant?.product?.storeId).toBe('store-1');
  });

  it('builds payload from product detail + selected variant', () => {
    const product = {
      id: 'prod-1',
      slug: 'kong-classic',
      storeId: 'store-1',
      name: 'Kong Classic',
      thumbnailUrl: null,
      store: { id: 'store-1', name: 'Pet Shop', slug: 'pet-shop' },
      variants: [
        {
          id: 'var-1',
          sku: 'KONG-M',
          price: 199,
          stockQuantity: 10,
          optionsJson: '{"size":"M"}',
        },
      ],
    } as ProductDetail;

    expect(
      buildBuyNowCheckoutPayload({
        product,
        variantId: 'var-1',
        quantity: 2,
      }),
    ).toEqual({
      ...samplePayload,
      thumbnailUrl: null,
    });
  });

  it('keeps honest compare-at on the synthetic cart line when higher than payable', () => {
    const product = {
      id: 'prod-1',
      slug: 'kong-classic',
      storeId: 'store-1',
      name: 'Kong Classic',
      thumbnailUrl: null,
      store: { id: 'store-1', name: 'Pet Shop', slug: 'pet-shop' },
      variants: [
        {
          id: 'var-1',
          sku: 'KONG-M',
          price: 279,
          stockQuantity: 10,
          optionsJson: '{"size":"M"}',
        },
      ],
    } as ProductDetail;

    const payload = buildBuyNowCheckoutPayload({
      product,
      variantId: 'var-1',
      quantity: 1,
      price: 223.2,
      compareAtPrice: 279,
    });

    expect(payload?.compareAtPrice).toBe(279);
    expect(toBuyNowCartItem(payload!).productVariant?.compareAtPrice).toBe(279);
  });

  it('returns null when variant is missing', () => {
    const product = {
      id: 'prod-1',
      slug: 'kong-classic',
      storeId: 'store-1',
      name: 'Kong Classic',
      thumbnailUrl: null,
      store: { id: 'store-1', name: 'Pet Shop', slug: 'pet-shop' },
      variants: [],
    } as unknown as ProductDetail;

    expect(
      buildBuyNowCheckoutPayload({
        product,
        variantId: 'missing',
        quantity: 1,
      }),
    ).toBeNull();
  });
});
