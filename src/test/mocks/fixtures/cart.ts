import type { CartQuery } from '@/lib/graphql/generated/graphql';
import { CATALOG_PRODUCT_ID, CATALOG_STORE_ID, sampleProductDetail } from './catalog';

export const sampleCartItem: CartQuery['cart']['items'][number] = {
  id: 'cart-item-1',
  quantity: 2,
  variantId: 'var-small',
  productVariant: {
    id: 'var-small',
    price: 890,
    sku: 'DOG-S',
    optionsJson: '{"size":"S"}',
    product: {
      id: CATALOG_PRODUCT_ID,
      name: sampleProductDetail.name,
      slug: sampleProductDetail.slug,
      storeId: CATALOG_STORE_ID,
      thumbnailUrl: sampleProductDetail.thumbnailUrl,
      store: sampleProductDetail.store
        ? {
            id: sampleProductDetail.store.id,
            name: sampleProductDetail.store.name,
            slug: sampleProductDetail.store.slug,
          }
        : null,
    },
  },
};

export const sampleEmptyCart: CartQuery['cart'] = {
  id: 'cart-1',
  sessionId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  customerId: null,
  items: [],
};

export const sampleCart: CartQuery['cart'] = {
  ...sampleEmptyCart,
  items: [sampleCartItem],
};
