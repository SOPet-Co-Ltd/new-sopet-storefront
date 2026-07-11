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
  showReviewedTag?: boolean;
};

export function OrderListItem({ order, showReviewedTag = false }: OrderListItemProps) {
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
        <div className="flex flex-wrap items-center gap-2">
          {showReviewedTag ? (
            <AccountStatusBadge variant="default">รีวิวแล้ว</AccountStatusBadge>
          ) : null}
          <AccountStatusBadge variant={getOrderStatusBadgeVariant(order.status)}>
            {statusLabel}
          </AccountStatusBadge>
        </div>
      </div>
      <ul className="mt-3 space-y-1">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 sop-body-sm-regular text-sop-neutral-gray-300"
          >
            <span className="min-w-0 flex-1 text-sop-neutral-gray-200">
              {item.productName || 'สินค้า'}
            </span>
            <span className="shrink-0 text-sop-neutral-gray-400">× {item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sop-neutral-grayalpha-100 pt-3">
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">{itemCount} รายการ</p>
        <p className="sop-body-sm-medium text-sop-secondary-600">{formatPrice(order.total)}</p>
      </div>
    </Link>
  );
}
