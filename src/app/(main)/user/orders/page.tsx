'use client';

import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { OrderListItem } from '@/components/molecules/OrderListItem/OrderListItem';
import { useOrders } from '@/lib/hooks/useOrders';

export default function UserOrdersPage() {
  const { orders, loading } = useOrders();

  return (
    <AccountLayout title="คำสั่งซื้อสินค้า">
      <section className="space-y-3">
        {loading ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-12 text-center">
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีคำสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderListItem key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </AccountLayout>
  );
}
