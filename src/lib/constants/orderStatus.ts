export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'รอชำระเงิน',
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมสินค้า',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งสำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
};

export type OrderStatusBadgeVariant = 'default' | 'error' | 'warning' | 'success';

export const ORDER_STATUS_BADGE_VARIANTS: Record<string, OrderStatusBadgeVariant> = {
  pending_payment: 'warning',
  pending: 'warning',
  paid: 'success',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

export function getOrderStatusBadgeVariant(status: string): OrderStatusBadgeVariant {
  return ORDER_STATUS_BADGE_VARIANTS[status] ?? 'default';
}

export const CANONICAL_ORDER_STATUS_KEYS = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
