'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS_LABELS, getOrderStatusBadgeVariant } from '@/lib/constants/orderStatus';
import { prefetchOrderDetail } from '@/lib/account/prefetchAccountPage';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import type { OrderSummary } from '@/lib/hooks/useOrders';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type OrderListItemProps = {
  order: OrderSummary;
};

export function OrderListItem({ order }: OrderListItemProps) {
  const router = useRouter();
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderHref = `/user/orders/${order.id}`;

  return (
    <Link
      href={orderHref}
      className="block rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4 transition-colors hover:border-sop-primary-300 hover:bg-sop-primary-50"
      onMouseEnter={() => {
        router.prefetch(orderHref);
        prefetchOrderDetail(order.id);
      }}
      onFocus={() => {
        router.prefetch(orderHref);
        prefetchOrderDetail(order.id);
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">
            คำสั่งซื้อ #{order.orderNumber}
          </p>
          <p className="sop-body-xs-regular text-sop-neutral-gray-400">
            {formatThaiDateTime(order.createdAt)}
          </p>
        </div>
        <AccountStatusBadge variant={getOrderStatusBadgeVariant(order.status)}>
          {statusLabel}
        </AccountStatusBadge>
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
