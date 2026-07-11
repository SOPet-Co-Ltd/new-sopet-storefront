import { CHECKOUT_STORE_ID } from './checkout';

/** Seeded public order number for MSW success fixture (parallel Phase 0). */
export const ORDER_TRACKING_SEED_NUMBER = 'ORD-SEED-001';

/**
 * Mirrors `OrderTrackingFields` on `OrderTrackingType` (order-tracking-frontend.md)
 * until storefront codegen lands in frontend-task-02.
 */
export type OrderTrackingFixture = {
  __typename: 'OrderTrackingType';
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  items: OrderTrackingItemFixture[];
  storeShippings: OrderTrackingStoreShippingFixture[];
};

export type OrderTrackingItemFixture = {
  __typename: 'OrderTrackingItemType';
  storeId: string;
  productId: string | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  fulfillmentProvider: string | null;
  trackingUrl: string | null;
};

export type OrderTrackingStoreShippingFixture = {
  __typename: 'OrderTrackingStoreShippingType';
  storeId: string;
  optionName: string;
  shippingFee: number;
};

/** AC-010 excluded keys — must not appear in MSW fixture or handler response. */
export const ORDER_TRACKING_EXCLUDED_PII_KEYS = [
  'id',
  'customerId',
  'guestPhone',
  'guestName',
  'guestEmail',
  'shippingAddress',
  'paymentMethod',
  'paymentReference',
  'notes',
  'paidAt',
] as const;

export const sampleOrderTracking: OrderTrackingFixture = {
  __typename: 'OrderTrackingType',
  orderNumber: ORDER_TRACKING_SEED_NUMBER,
  status: 'paid',
  createdAt: '2026-07-06T10:00:00.000Z',
  subtotal: 500,
  shippingFee: 50,
  discountAmount: 10,
  total: 540,
  items: [
    {
      __typename: 'OrderTrackingItemType',
      storeId: CHECKOUT_STORE_ID,
      productId: 'product-seed-1',
      productName: 'Premium Dog Food 5kg',
      productImageUrl: 'https://cdn.example.com/products/dog-food-5kg.jpg',
      quantity: 1,
      unitPrice: 500,
      subtotal: 500,
      fulfillmentStatus: 'shipped',
      trackingNumber: 'TH123456789',
      fulfillmentProvider: 'kerry',
      trackingUrl: 'https://track.example.com/TH123456789',
    },
  ],
  storeShippings: [
    {
      __typename: 'OrderTrackingStoreShippingType',
      storeId: CHECKOUT_STORE_ID,
      optionName: 'จัดส่งมาตรฐาน',
      shippingFee: 50,
    },
  ],
};
