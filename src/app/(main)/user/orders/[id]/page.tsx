'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { Button } from '@/components/atoms/Button';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import { ORDER_STATUS_LABELS } from '@/lib/constants/orderStatus';
import { useOrders, type OrderDetail } from '@/lib/hooks/useOrders';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { fetchOrder, confirmOrderDelivered, confirmingDelivery } = useOrders();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    void fetchOrder(params.id)
      .then((result) => setOrder(result ?? null))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดคำสั่งซื้อได้');
        setOrder(null);
      });
  }, [params.id, fetchOrder]);

  const handleConfirmDelivery = async () => {
    if (!order) return;
    setError(null);
    try {
      const updated = await confirmOrderDelivered(order.id);
      if (updated) {
        setOrder(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ยืนยันการรับสินค้าไม่สำเร็จ');
    }
  };

  if (order === undefined) {
    return (
      <AccountLayout title="รายละเอียดคำสั่งซื้อ">
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout title="รายละเอียดคำสั่งซื้อ">
        <p className="sop-body-sm-regular text-sop-system-error-400">
          {error ?? 'ไม่พบคำสั่งซื้อ'}
        </p>
        <Link href="/user/orders" className="mt-4 inline-block sop-body-sm-medium text-sop-secondary-500 underline">
          กลับไปรายการคำสั่งซื้อ
        </Link>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AccountStatusBadge className="px-3 py-1 sop-body-sm-medium">
            {statusLabel}
          </AccountStatusBadge>
          <div className="flex flex-wrap gap-2">
            {order.status === 'shipped' ? (
              <Button
                variant="primary"
                disabled={confirmingDelivery}
                onClick={() => void handleConfirmDelivery()}
              >
                {confirmingDelivery ? 'กำลังยืนยัน...' : 'ยืนยันได้รับสินค้าแล้ว'}
              </Button>
            ) : null}
            {order.status === 'delivered' ? (
              <Link href="/user/reviews?tab=pending">
                <Button variant="primary">เขียนรีวิว</Button>
              </Link>
            ) : null}
            <Link href={`/user/orders/${order.id}/return`}>
              <Button variant="outline">ขอคืนสินค้า</Button>
            </Link>
          </div>
        </div>

        {error ? (
          <p className="sop-body-sm-regular text-sop-system-error-400" role="alert">
            {error}
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

        <Link href="/user/orders" className="inline-block sop-body-sm-medium text-sop-secondary-500 underline">
          กลับไปรายการคำสั่งซื้อ
        </Link>
      </div>
    </AccountLayout>
  );
}
