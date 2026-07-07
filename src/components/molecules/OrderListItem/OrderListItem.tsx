'use client';

import Link from 'next/link';
import type { OrderSummary } from '@/lib/hooks/useOrders';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมสินค้า',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งสำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
};

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

function formatOrderDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type OrderListItemProps = {
  order: OrderSummary;
};

export function OrderListItem({ order }: OrderListItemProps) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href={`/user/orders/${order.id}`}
      className="block rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4 transition-colors hover:border-sop-primary-300 hover:bg-sop-primary-50"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">
            คำสั่งซื้อ #{order.orderNumber}
          </p>
          <p className="sop-body-xs-regular text-sop-neutral-gray-400">
            {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <span className="rounded-sop-8px bg-sop-primary-100 px-2 py-0.5 sop-body-xs-medium text-sop-primary-600">
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="sop-body-sm-regular text-sop-neutral-gray-300">
          {itemCount} รายการ
        </p>
        <p className="sop-body-sm-medium text-sop-secondary-600">{formatPrice(order.total)}</p>
      </div>
    </Link>
  );
}
