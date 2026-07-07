'use client';

import { useState } from 'react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { OrderListItem } from '@/components/molecules/OrderListItem/OrderListItem';
import { useOrders } from '@/lib/hooks/useOrders';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';

export default function UserOrdersPage() {
  const { orders, loading, fetchGuestOrders } = useOrders();
  const [guestPhone, setGuestPhone] = useState('');
  const [guestOrders, setGuestOrders] = useState<typeof orders>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [showGuestResults, setShowGuestResults] = useState(false);

  const handleGuestLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeThaiPhoneNumber(guestPhone);
    if (!isValidThaiPhoneNumber(normalized)) {
      setGuestError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    try {
      setGuestLoading(true);
      setGuestError(null);
      const result = await fetchGuestOrders(normalized);
      setGuestOrders(result);
      setShowGuestResults(true);
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : 'ไม่สามารถค้นหาคำสั่งซื้อได้');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AccountLayout title="คำสั่งซื้อสินค้า">
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="sop-body-md-medium text-sop-neutral-gray-200">คำสั่งซื้อของฉัน</h2>
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

        <section className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6">
          <h2 className="sop-body-md-medium text-sop-neutral-gray-200">ค้นหาคำสั่งซื้อ (ไม่ได้เข้าสู่ระบบ)</h2>
          <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-400">
            ค้นหาคำสั่งซื้อที่สั่งด้วยเบอร์โทรศัพท์
          </p>
          <form onSubmit={(e) => void handleGuestLookup(e)} className="mt-4 flex flex-wrap gap-3">
            <div className="min-w-[200px] flex-1">
              <Input
                title="เบอร์โทรศัพท์"
                type="tel"
                inputMode="tel"
                placeholder="0812345678"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={guestLoading} disabled={guestLoading}>
                ค้นหา
              </Button>
            </div>
          </form>
          {guestError ? (
            <p role="alert" className="mt-2 sop-body-sm-regular text-sop-system-error-400">
              {guestError}
            </p>
          ) : null}
          {showGuestResults ? (
            <div className="mt-4 space-y-3">
              {guestOrders.length === 0 ? (
                <p className="sop-body-sm-regular text-sop-neutral-gray-400">ไม่พบคำสั่งซื้อ</p>
              ) : (
                guestOrders.map((order) => <OrderListItem key={order.id} order={order} />)
              )}
            </div>
          ) : null}
        </section>
      </div>
    </AccountLayout>
  );
}
