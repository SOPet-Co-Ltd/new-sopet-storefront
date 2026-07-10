'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountBackLink } from '@/components/molecules/account/AccountBackLink';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { Button } from '@/components/atoms/Button';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import {
  ORDER_STATUS_LABELS,
  getOrderStatusBadgeVariant,
  isPendingPaymentStatus,
  isReturnEligibleOrderStatus,
} from '@/lib/constants/orderStatus';
import { useOrderDetail } from '@/lib/hooks/useOrders';
import { useOrderPendingReviews } from '@/lib/hooks/useOrderPendingReviews';
import { getOrdersListReturnUrl } from '@/lib/orders/orderListReturnUrl';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [ordersReturnUrl, setOrdersReturnUrl] = useState('/user/orders');
  const { order, loading, error, confirmOrderDelivered, confirmingDelivery } = useOrderDetail(
    params.id,
  );
  const isDelivered = order?.status === 'delivered';
  const { hasPendingReviews, loading: pendingReviewsLoading } = useOrderPendingReviews(
    order?.id,
    isDelivered,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setOrdersReturnUrl(getOrdersListReturnUrl());
  }, []);

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
  const shipments = order.items.reduce<
    Map<
      string,
      { fulfillmentProvider?: string | null; trackingNumber?: string | null; trackingUrl?: string | null }
    >
  >((map, item) => {
    if (!item.trackingNumber && !item.fulfillmentProvider && !item.trackingUrl) {
      return map;
    }
    if (!map.has(item.storeId)) {
      map.set(item.storeId, {
        fulfillmentProvider: item.fulfillmentProvider,
        trackingNumber: item.trackingNumber,
        trackingUrl: item.trackingUrl,
      });
    }
    return map;
  }, new Map());

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
            {isPendingPaymentStatus(order.status) ? (
              <Link href={`/payment/${order.id}`}>
                <Button variant="primary">ชำระเงิน</Button>
              </Link>
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
                <Link href="/user/reviews?tab=pending">
                  <Button variant="primary">เขียนรีวิว</Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  disabled
                  title="รีวิวสินค้าจากคำสั่งซื้อนี้ครบแล้ว"
                >
                  {pendingReviewsLoading ? 'กำลังตรวจสอบ...' : 'เขียนรีวิวแล้ว'}
                </Button>
              )
            ) : null}
            {!isPendingPaymentStatus(order.status) && isReturnEligibleOrderStatus(order.status) ? (
              <Link href={`/user/orders/${order.id}/return`}>
                <Button variant="outline">ขอคืนสินค้า</Button>
              </Link>
            ) : null}
          </div>
        </div>

        {actionError ? (
          <p className="sop-body-sm-regular text-sop-system-error-400" role="alert">
            {actionError}
          </p>
        ) : null}

        {shipments.size > 0 ? (
          <AccountCard>
            <p className="mb-2 sop-body-sm-medium text-sop-neutral-gray-200">ติดตามพัสดุ</p>
            <ul className="space-y-3">
              {[...shipments.entries()].map(([storeId, shipment]) => (
                <li key={storeId} className="space-y-1">
                  {shipment.fulfillmentProvider ? (
                    <p className="sop-body-sm-regular text-sop-neutral-gray-300">
                      ขนส่ง:{' '}
                      <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                        {shipment.fulfillmentProvider}
                      </span>
                    </p>
                  ) : null}
                  {shipment.trackingNumber ? (
                    <p className="sop-body-sm-regular text-sop-neutral-gray-300">
                      เลขพัสดุ:{' '}
                      <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                        {shipment.trackingNumber}
                      </span>
                    </p>
                  ) : null}
                  {shipment.trackingUrl ? (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex sop-body-sm-medium text-sop-secondary-500 underline"
                    >
                      เปิดลิงก์ติดตามพัสดุ
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </AccountCard>
        ) : null}

        <OrderConfirmationSummary order={order} />
      </div>
    </AccountLayout>
  );
}
