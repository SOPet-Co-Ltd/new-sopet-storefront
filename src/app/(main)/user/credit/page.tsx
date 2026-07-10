'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';

export default function UserCreditPage() {
  const { paymentMethods, loading, deletePaymentMethod, setDefaultPaymentMethod } =
    usePaymentMethods();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const method = paymentMethods.find((item) => item.id === id);
    const isOnlyCard = paymentMethods.length === 1;
    const confirmMessage = method?.isDefault && !isOnlyCard
      ? 'ต้องการลบบัตรหลักนี้หรือไม่? ระบบจะตั้งบัตรอื่นเป็นบัตรหลักให้อัตโนมัติ'
      : 'ต้องการลบบัตรนี้หรือไม่?';

    if (!window.confirm(confirmMessage)) return;
    setActionId(id);
    try {
      await deletePaymentMethod(id);
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionId(id);
    try {
      await setDefaultPaymentMethod(id);
    } finally {
      setActionId(null);
    }
  };

  return (
    <AccountLayout title="บัตรเครดิต/เดบิต">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link href="/user/credit/add">
            <Button>เพิ่มบัตรใหม่</Button>
          </Link>
        </div>

        {loading ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : paymentMethods.length === 0 ? (
          <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-12 text-center">
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีบัตรที่บันทึกไว้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="sop-body-sm-medium text-sop-neutral-gray-200">
                        {method.brand.toUpperCase()} •••• {method.lastFour}
                      </p>
                      {method.isDefault ? (
                        <span className="rounded-sop-8px bg-sop-primary-100 px-2 py-0.5 sop-body-xs-medium text-sop-primary-600">
                          บัตรหลัก
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 sop-body-xs-regular text-sop-neutral-gray-400">
                      หมดอายุ {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!method.isDefault ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={actionId === method.id}
                      disabled={actionId === method.id}
                      onClick={() => void handleSetDefault(method.id)}
                    >
                      ตั้งเป็นบัตรหลัก
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={actionId === method.id}
                    disabled={actionId === method.id}
                    onClick={() => void handleDelete(method.id)}
                  >
                    ลบ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
