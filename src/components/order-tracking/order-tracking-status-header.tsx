import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { ORDER_STATUS_LABELS, getOrderStatusBadgeVariant } from '@/lib/constants/orderStatus';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';

type OrderTrackingStatusHeaderProps = {
  orderNumber: string;
  status: string;
  createdAt: string;
};

export function OrderTrackingStatusHeader({
  orderNumber,
  status,
  createdAt,
}: OrderTrackingStatusHeaderProps) {
  const statusLabel = ORDER_STATUS_LABELS[status] ?? status;

  return (
    <header role="status" data-testid="order-tracking-status-header">
      <h1 className="sr-only">ติดตามคำสั่งซื้อ</h1>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sop-body-md-medium text-sop-neutral-gray-200">{orderNumber}</p>
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">
            {formatThaiDateTime(createdAt)}
          </p>
        </div>
        <AccountStatusBadge variant={getOrderStatusBadgeVariant(status)}>
          {statusLabel}
        </AccountStatusBadge>
      </div>
    </header>
  );
}
