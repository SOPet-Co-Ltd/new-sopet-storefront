/**
 * Provisional Thai copy for store-suspension customer hold UX
 * (docs/ui-spec/store-suspension-customer-hold-ui-spec.md § Provisional Thai copy).
 */
export const STORE_SUSPENSION_HOLD_COPY = {
  orderStatusOnHold: 'พักการดำเนินการ',
  fulfillmentStatusOnHold: 'พักจัดส่ง',
  holdBannerMixed:
    'บางรายการถูกพักชั่วคราวเนื่องจากร้านค้าถูกระงับ การจัดส่งจากร้านอื่นยังดำเนินการได้ตามปกติ',
  holdBannerFull: 'คำสั่งซื้อถูกพักชั่วคราวเนื่องจากร้านค้าถูกระงับ',
  holdItemHint: 'พักชั่วคราว — ร้านค้าถูกระงับ',
  cartAddSuspended: 'ร้านค้านี้ถูกระงับชั่วคราว ไม่สามารถเพิ่มสินค้าลงตะกร้าได้',
  cartInvalidatedBanner: 'สินค้าจากร้านที่ถูกระงับถูกลบออกจากตะกร้าแล้ว',
  checkoutCreateSuspended: 'ไม่สามารถสร้างคำสั่งซื้อได้ เนื่องจากมีสินค้าจากร้านที่ถูกระงับ',
  paymentHeldBlocked: 'ไม่สามารถชำระเงินส่วนที่ถูกพักได้ในขณะนี้ เนื่องจากร้านค้าถูกระงับชั่วคราว',
  cancelHeldDenied:
    'ไม่สามารถยกเลิกรายการที่ถูกพักเนื่องจากร้านถูกระงับได้ กรุณาติดต่อฝ่ายสนับสนุนหากต้องการความช่วยเหลือ',
} as const;

export const STORE_SUSPENDED_ERROR_CODE = 'STORE_SUSPENDED';
export const SUSPENDED_STORE_ITEM_REMOVED_WARNING_CODE = 'SUSPENDED_STORE_ITEM_REMOVED';
export const ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE = 'ORDER_CONTAINS_SUSPENDED_STORE';
export const PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE = 'PAYMENT_HELD_PORTION_BLOCKED';

export const HOLD_FULFILLMENT_STATUS = 'on_hold';
export const HOLD_ORDER_STATUS = 'on_hold';
