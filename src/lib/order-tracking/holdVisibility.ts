import {
  HOLD_FULFILLMENT_STATUS,
  HOLD_ORDER_STATUS,
} from '@/lib/constants/storeSuspensionHoldCopy';

export type HoldBannerVariant = 'full' | 'mixed' | null;

export function hasHeldFulfillmentItems(
  items: Array<{ fulfillmentStatus?: string | null }>,
): boolean {
  return items.some((item) => item.fulfillmentStatus === HOLD_FULFILLMENT_STATUS);
}

export function resolveHoldBannerVariant(
  orderStatus: string,
  items: Array<{ fulfillmentStatus?: string | null }>,
): HoldBannerVariant {
  if (orderStatus === HOLD_ORDER_STATUS) {
    return 'full';
  }
  if (hasHeldFulfillmentItems(items)) {
    return 'mixed';
  }
  return null;
}

export function shouldShowOrderTrackingProgress(status: string): boolean {
  return status !== 'cancelled' && status !== 'refunded' && status !== HOLD_ORDER_STATUS;
}
