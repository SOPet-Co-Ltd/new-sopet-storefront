'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountBackLink } from '@/components/molecules/account/AccountBackLink';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { OrderPaymentCountdown } from '@/components/molecules/account/OrderPaymentCountdown';
import { Button } from '@/components/atoms/Button';
import { OrderHoldBanner } from '@/components/order-tracking/order-hold-banner';
import { OrderShipmentTrackingList } from '@/components/order-tracking/order-shipment-tracking-list';
import { HeldUnpaidPaymentBlock } from '@/components/organisms/OrderPaymentForm/HeldUnpaidPaymentBlock';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import {
  ORDER_STATUS_LABELS,
  getOrderStatusBadgeVariant,
  isPendingPaymentStatus,
} from '@/lib/constants/orderStatus';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';
import { useOrderDetail } from '@/lib/hooks/useOrders';
import { useOrderPendingReviews } from '@/lib/hooks/useOrderPendingReviews';
import {
  hasHeldFulfillmentItems,
  resolveHoldBannerVariant,
} from '@/lib/order-tracking/holdVisibility';
import { getOrdersListReturnUrl } from '@/lib/orders/orderListReturnUrl';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const ordersReturnUrl = useSyncExternalStore(
    () => () => {},
    getOrdersListReturnUrl,
    () => '/user/orders',
  );
  const { order, loading, error, confirmOrderDelivered, confirmingDelivery } = useOrderDetail(
    params.id,
  );
  const isDelivered = order?.status === 'delivered';
  const { hasPendingReviews, loading: pendingReviewsLoading } = useOrderPendingReviews(
    order?.id,
    isDelivered,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setActionError(null);
    try {
      await confirmOrderDelivered(order.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'ยืนยันการรับสินค้าไม่สำเร็จ');
    }
  };

  if (loading) {
    return (
      <AccountLayout title="รายละเอียดคำสั่งซื้อ">
        <div className="space-y-4">
          <AccountBackLink href={ordersReturnUrl} label="กลับไปรายการคำสั่งซื้อ" />
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout title="รายละเอียดคำสั่งซื้อ">
        <div className="space-y-4">
          <AccountBackLink href={ordersReturnUrl} label="กลับไปรายการคำสั่งซื้อ" />
          <p className="sop-body-sm-regular text-sop-system-error-400">
            {error?.message ?? 'ไม่พบคำสั่งซื้อ'}
          </p>
        </div>
      </AccountLayout>
    );
  }

  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
  const orderHasHeldItems = hasHeldFulfillmentItems(order.items);
  const holdBannerVariant = resolveHoldBannerVariant(order.status, order.items);
  const heldUnpaidBlocked = isPendingPaymentStatus(order.status) && orderHasHeldItems;
  const canPay = isPendingPaymentStatus(order.status) && !heldUnpaidBlocked;

  return (
    <AccountLayout title="รายละเอียดคำสั่งซื้อ">
      <div className="space-y-6">
        <AccountBackLink href={ordersReturnUrl} label="กลับไปรายการคำสั่งซื้อ" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <AccountStatusBadge
            className="px-3 py-1 sop-body-sm-medium"
            variant={getOrderStatusBadgeVariant(order.status)}
          >
            {statusLabel}
          </AccountStatusBadge>
          <div className="flex flex-wrap gap-2">
            {canPay ? (
              <Link href={`/payment/${order.id}`}>
                <Button variant="primary">ชำระเงิน</Button>
              </Link>
            ) : null}
            {heldUnpaidBlocked ? (
              <Button variant="primary" disabled data-testid="order-pay-cta-held-disabled">
                ชำระเงิน
              </Button>
            ) : null}
            {order.status === 'shipped' ? (
              <Button
                variant="primary"
                disabled={confirmingDelivery}
                onClick={() => void handleConfirmDelivery()}
              >
                {confirmingDelivery ? 'กำลังยืนยัน...' : 'ยืนยันได้รับสินค้าแล้ว'}
              </Button>
            ) : null}
            {isDelivered ? (
              hasPendingReviews ? (
                <Link href={`/user/reviews?orderId=${order.id}`}>
                  <Button variant="primary">เขียนรีวิว</Button>
                </Link>
              ) : (
                <Button variant="primary" disabled title="รีวิวสินค้าจากคำสั่งซื้อนี้ครบแล้ว">
                  {pendingReviewsLoading ? 'กำลังตรวจสอบ...' : 'เขียนรีวิวแล้ว'}
                </Button>
              )
            ) : null}
          </div>
        </div>

        {holdBannerVariant ? <OrderHoldBanner variant={holdBannerVariant} /> : null}

        {heldUnpaidBlocked ? <HeldUnpaidPaymentBlock /> : null}

        {orderHasHeldItems ? (
          <p
            className="sop-body-sm-regular text-sop-neutral-gray-400"
            data-testid="cancel-held-denied"
            role="status"
          >
            {STORE_SUSPENSION_HOLD_COPY.cancelHeldDenied}
          </p>
        ) : null}

        {isPendingPaymentStatus(order.status) ? (
          <OrderPaymentCountdown createdAt={order.createdAt} />
        ) : null}

        {actionError ? (
          <p className="sop-body-sm-regular text-sop-system-error-400" role="alert">
            {actionError}
          </p>
        ) : null}

        <OrderShipmentTrackingList items={order.items} />

        <OrderConfirmationSummary order={order} />
      </div>
    </AccountLayout>
  );
}
