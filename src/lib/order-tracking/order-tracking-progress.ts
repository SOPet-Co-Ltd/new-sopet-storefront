export const ORDER_TRACKING_STEPS = [
  { key: 'paid', label: 'ชำระเงิน' },
  { key: 'processing', label: 'เตรียมสินค้า' },
  { key: 'shipped', label: 'จัดส่ง' },
  { key: 'delivered', label: 'ส่งถึงแล้ว' },
] as const;

const STATUS_TO_ACTIVE_STEP: Record<string, number> = {
  pending_payment: -1,
  pending: -1,
  paid: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
  refunded: -1,
};

export function getOrderTrackingActiveStep(status: string): number {
  return STATUS_TO_ACTIVE_STEP[status] ?? -1;
}

export function isTerminalOrderStatus(status: string): boolean {
  return status === 'cancelled' || status === 'refunded';
}
