'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import { useOrders, type OrderDetail } from '@/lib/hooks/useOrders';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  processing: 'กำลังเตรียมสินค้า',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งสำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { fetchOrder } = useOrders();
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

  return (
    <AccountLayout title="รายละเอียดคำสั่งซื้อ">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-sop-8px bg-sop-primary-100 px-3 py-1 sop-body-sm-medium text-sop-primary-600">
            {statusLabel}
          </span>
          <Link href={`/user/orders/${order.id}/return`}>
            <Button variant="outline">ขอคืนสินค้า</Button>
          </Link>
        </div>

        <OrderConfirmationSummary order={order} />

        <Link href="/user/orders" className="inline-block sop-body-sm-medium text-sop-secondary-500 underline">
          กลับไปรายการคำสั่งซื้อ
        </Link>
      </div>
    </AccountLayout>
  );
}
