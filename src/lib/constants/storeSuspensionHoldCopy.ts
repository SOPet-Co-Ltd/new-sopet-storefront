import { ERROR_MESSAGES } from '@/lib/errors/errorMessages';

/**
 * Provisional Thai copy for store-suspension customer hold UX
 * (docs/ui-spec/store-suspension-customer-hold-ui-spec.md § Provisional Thai copy).
 * API-code-backed strings are sourced from the error catalog to avoid duplication.
 */
export const STORE_SUSPENSION_HOLD_COPY = {
  orderStatusOnHold: 'พักการดำเนินการ',
  fulfillmentStatusOnHold: 'พักจัดส่ง',
  holdBannerMixed:
    'บางรายการถูกพักชั่วคราวเนื่องจากร้านค้าถูกระงับ การจัดส่งจากร้านอื่นยังดำเนินการได้ตามปกติ',
  holdBannerFull: 'คำสั่งซื้อถูกพักชั่วคราวเนื่องจากร้านค้าถูกระงับ',
  holdItemHint: 'พักชั่วคราว — ร้านค้าถูกระงับ',
  cartAddSuspended: ERROR_MESSAGES.STORE_SUSPENDED,
  cartInvalidatedBanner: ERROR_MESSAGES.SUSPENDED_STORE_ITEM_REMOVED,
  checkoutCreateSuspended: ERROR_MESSAGES.ORDER_CONTAINS_SUSPENDED_STORE,
  paymentHeldBlocked: ERROR_MESSAGES.PAYMENT_HELD_PORTION_BLOCKED,
  cancelHeldDenied: ERROR_MESSAGES.HOLD_CANCEL_FORBIDDEN,
} as const;

export const STORE_SUSPENDED_ERROR_CODE = 'STORE_SUSPENDED';
export const SUSPENDED_STORE_ITEM_REMOVED_WARNING_CODE = 'SUSPENDED_STORE_ITEM_REMOVED';
export const ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE = 'ORDER_CONTAINS_SUSPENDED_STORE';
export const PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE = 'PAYMENT_HELD_PORTION_BLOCKED';

export const HOLD_FULFILLMENT_STATUS = 'on_hold';
export const HOLD_ORDER_STATUS = 'on_hold';
