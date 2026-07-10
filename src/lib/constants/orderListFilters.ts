import type { CustomerOrderListFilter } from '@/lib/graphql/generated/graphql';

export const ORDERS_PAGE_SIZE = 10;

export type OrderListFilterId = CustomerOrderListFilter;

export const ORDER_LIST_FILTERS: ReadonlyArray<{
  id: OrderListFilterId;
  label: string;
}> = [
  { id: 'ALL', label: 'ทั้งหมด' },
  { id: 'PENDING_PAYMENT', label: 'รอชำระเงิน' },
  { id: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
  { id: 'DELIVERED', label: 'ส่งสำเร็จ' },
  { id: 'CANCELLED', label: 'ยกเลิก/คืนเงิน' },
] as const;

const ORDER_LIST_FILTER_IDS = new Set<OrderListFilterId>(
  ORDER_LIST_FILTERS.map((filter) => filter.id),
);

export function parseOrderListFilter(value: string | null | undefined): OrderListFilterId {
  if (value && ORDER_LIST_FILTER_IDS.has(value as OrderListFilterId)) {
    return value as OrderListFilterId;
  }
  return 'ALL';
}

export function parseOrdersPage(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function getOrderListEmptyMessage(filter: OrderListFilterId): string {
  return filter === 'ALL' ? 'ยังไม่มีคำสั่งซื้อ' : 'ไม่มีคำสั่งซื้อในหมวดนี้';
}
