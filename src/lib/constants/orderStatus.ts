export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'รอชำระเงิน',
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมสินค้า',
  on_hold: 'พักการดำเนินการ',
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
  on_hold: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

export function getOrderStatusBadgeVariant(status: string): OrderStatusBadgeVariant {
  return ORDER_STATUS_BADGE_VARIANTS[status] ?? 'default';
}

/** Customer-facing label; bank transfer unpaid orders wait on admin confirm. */
export function getOrderStatusLabel(status: string, paymentMethod?: string | null): string {
  if (isPendingPaymentStatus(status) && paymentMethod === 'bank_transfer') {
    return 'รอตรวจสอบการโอนเงิน';
  }
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function isPendingPaymentStatus(status: string): boolean {
  return status === 'pending_payment' || status === 'pending';
}

export function isReturnEligibleOrderStatus(status: string): boolean {
  return status === 'shipped' || status === 'delivered';
}

export const CANONICAL_ORDER_STATUS_KEYS = [
  'pending_payment',
  'paid',
  'processing',
  'on_hold',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
