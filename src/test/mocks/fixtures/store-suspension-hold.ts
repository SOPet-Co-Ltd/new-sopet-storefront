import { CHECKOUT_STORE_ID } from './checkout';
import {
  sampleOrderTracking,
  type OrderTrackingFixture,
  type OrderTrackingItemFixture,
} from './order-tracking';

const SECOND_STORE_ID = 'store-held-b';

function cloneItem(overrides: Partial<OrderTrackingItemFixture> = {}): OrderTrackingItemFixture {
  return {
    ...sampleOrderTracking.items[0],
    ...overrides,
  };
}

/** Full hold: order.status on_hold, all non-terminal items on_hold. */
export const sampleOrderTrackingFullHold: OrderTrackingFixture = {
  ...sampleOrderTracking,
  orderNumber: 'ORD-HOLD-FULL',
  status: 'on_hold',
  items: [
    cloneItem({
      productName: 'Held Dog Food',
      fulfillmentStatus: 'on_hold',
      trackingNumber: null,
      fulfillmentProvider: null,
      trackingUrl: null,
    }),
  ],
};

/** Mixed hold: order progressing, one store held, sibling progressing. */
export const sampleOrderTrackingMixedHold: OrderTrackingFixture = {
  ...sampleOrderTracking,
  orderNumber: 'ORD-HOLD-MIXED',
  status: 'processing',
  items: [
    cloneItem({
      storeId: CHECKOUT_STORE_ID,
      productId: 'product-held-1',
      productName: 'Held Item A',
      fulfillmentStatus: 'on_hold',
      trackingNumber: null,
      fulfillmentProvider: null,
      trackingUrl: null,
      subtotal: 250,
      unitPrice: 250,
    }),
    cloneItem({
      storeId: SECOND_STORE_ID,
      productId: 'product-ok-2',
      productName: 'Active Item B',
      fulfillmentStatus: 'processing',
      trackingNumber: null,
      fulfillmentProvider: null,
      trackingUrl: null,
      subtotal: 250,
      unitPrice: 250,
    }),
  ],
  storeShippings: [
    {
      __typename: 'OrderTrackingStoreShippingType',
      storeId: CHECKOUT_STORE_ID,
      optionName: 'จัดส่งมาตรฐาน',
      shippingFee: 25,
    },
    {
      __typename: 'OrderTrackingStoreShippingType',
      storeId: SECOND_STORE_ID,
      optionName: 'จัดส่งมาตรฐาน',
      shippingFee: 25,
    },
  ],
  subtotal: 500,
  shippingFee: 50,
  total: 540,
};

/** Decision #15 sticky unpaid: pending_payment + item-level holds. */
export const sampleOrderTrackingHeldUnpaid: OrderTrackingFixture = {
  ...sampleOrderTracking,
  orderNumber: 'ORD-HOLD-UNPAID',
  status: 'pending_payment',
  items: [
    cloneItem({
      productName: 'Unpaid Held Item',
      fulfillmentStatus: 'on_hold',
      trackingNumber: null,
      fulfillmentProvider: null,
      trackingUrl: null,
    }),
  ],
};

export const sampleCartWarningsSuspendedRemoved = [
  {
    code: 'SUSPENDED_STORE_ITEM_REMOVED',
    message: 'Suspended store items removed',
    variantId: 'variant-suspended-1',
  },
];
