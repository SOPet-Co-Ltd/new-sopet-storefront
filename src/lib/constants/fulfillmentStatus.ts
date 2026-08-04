import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังเตรียม',
  on_hold: STORE_SUSPENSION_HOLD_COPY.fulfillmentStatusOnHold,
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งถึงแล้ว',
  cancelled: 'ยกเลิก',
};

export function labelFulfillmentStatus(status: string): string {
  return FULFILLMENT_STATUS_LABELS[status] ?? status;
}
