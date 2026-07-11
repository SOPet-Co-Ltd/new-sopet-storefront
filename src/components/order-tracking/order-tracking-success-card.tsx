import { DeliveryTruckIcon } from '@/components/atoms/icons';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import {
  OrderConfirmationSummary,
  type OrderSummaryDisplayOrder,
} from '@/components/organisms/OrderConfirmationSummary';
import { ORDER_STATUS_LABELS, getOrderStatusBadgeVariant } from '@/lib/constants/orderStatus';
import { labelFulfillmentStatus } from '@/lib/constants/fulfillmentStatus';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import {
  groupItemsByStoreShipment,
  type ShipmentTrackingItem,
} from '@/lib/order-tracking/group-items-by-store-shipment';
import { isTerminalOrderStatus } from '@/lib/order-tracking/order-tracking-progress';
import { OrderTrackingProgressStepper } from './order-tracking-progress-stepper';

type OrderTrackingSuccessCardProps = {
  order: OrderSummaryDisplayOrder;
  status: string;
  items: ShipmentTrackingItem[];
};

export function OrderTrackingSuccessCard({ order, status, items }: OrderTrackingSuccessCardProps) {
  const statusLabel = ORDER_STATUS_LABELS[status] ?? status;
  const shipments = groupItemsByStoreShipment(items);
  const hasShipmentTracking = shipments.size > 0;
  const showProgress = !isTerminalOrderStatus(status);

  return (
    <article
      className="overflow-hidden rounded-sop-24px border border-sop-neutral-grayalpha-200 bg-sop-base-white shadow-md"
      data-testid="order-tracking-success"
    >
      <header
        className="relative overflow-hidden bg-gradient-to-br from-sop-primary-200 via-sop-primary-100 to-sop-base-white px-6 pb-6 pt-8 md:px-8"
        data-testid="order-tracking-status-header"
        role="status"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sop-primary-300/30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 left-1/3 h-24 w-24 rounded-full bg-sop-secondary-200/20"
        />

        <div className="relative flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sop-16 bg-sop-base-white shadow-sm">
              <DeliveryTruckIcon size={{ mobile: 28 }} color="#6E76EE" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="sop-body-sm-medium text-sop-primary-600">ติดตามคำสั่งซื้อ</p>
              <h1 className="mt-1 break-all sop-headline-xs-medium text-sop-neutral-gray-200 md:sop-headline-sm-medium">
                {order.orderNumber}
              </h1>
              <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-400">
                {formatThaiDateTime(order.createdAt)}
              </p>
            </div>
            <AccountStatusBadge
              className="shrink-0 px-3 py-1 sop-body-sm-medium"
              variant={getOrderStatusBadgeVariant(status)}
            >
              {statusLabel}
            </AccountStatusBadge>
          </div>

          {showProgress ? <OrderTrackingProgressStepper status={status} /> : null}
        </div>
      </header>

      <div className="space-y-6 px-6 py-6 md:px-8">
        {hasShipmentTracking ? (
          <section
            className="rounded-sop-16 border border-sop-primary-200 bg-sop-primary-50 p-4"
            aria-label="ติดตามพัสดุ"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sop-primary-200">
                <DeliveryTruckIcon size={{ mobile: 18 }} color="#6E76EE" />
              </span>
              <p className="sop-body-sm-medium text-sop-neutral-gray-200">ติดตามพัสดุ</p>
            </div>
            <ul className="space-y-4">
              {[...shipments.entries()].map(([storeId, shipment]) => (
                <li
                  key={storeId}
                  className="rounded-sop-12 border border-sop-primary-200/60 bg-sop-base-white p-3"
                >
                  <dl className="space-y-2">
                    {shipment.fulfillmentProvider ? (
                      <div className="flex justify-between gap-3">
                        <dt className="sop-body-sm-regular text-sop-neutral-gray-400">ขนส่ง</dt>
                        <dd className="sop-body-sm-medium text-sop-neutral-gray-200">
                          {shipment.fulfillmentProvider}
                        </dd>
                      </div>
                    ) : null}
                    {shipment.trackingNumber ? (
                      <div className="flex justify-between gap-3">
                        <dt className="sop-body-sm-regular text-sop-neutral-gray-400">เลขพัสดุ</dt>
                        <dd className="font-mono sop-body-sm-medium text-sop-secondary-600">
                          {shipment.trackingNumber}
                        </dd>
                      </div>
                    ) : null}
                    {shipment.fulfillmentStatus ? (
                      <div className="flex justify-between gap-3">
                        <dt className="sop-body-sm-regular text-sop-neutral-gray-400">
                          สถานะจัดส่ง
                        </dt>
                        <dd className="sop-body-sm-medium text-sop-neutral-gray-200">
                          {labelFulfillmentStatus(shipment.fulfillmentStatus)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {shipment.trackingUrl ? (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-sop-8 bg-sop-primary-500 px-4 py-2 sop-body-sm-medium text-sop-base-white transition-colors hover:bg-sop-primary-600"
                    >
                      เปิดลิงก์ติดตามพัสดุ
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-label="รายละเอียดคำสั่งซื้อ">
          <OrderConfirmationSummary order={order} hideHeader className="border-0 p-0 shadow-none" />
        </section>
      </div>
    </article>
  );
}
