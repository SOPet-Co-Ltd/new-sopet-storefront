'use client';

import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
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
          <AccountCard padding="lg">
            <AccountEmptyState message="ยังไม่มีคำสั่งซื้อ" />
          </AccountCard>
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
