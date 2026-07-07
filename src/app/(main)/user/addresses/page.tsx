'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { useAddresses } from '@/lib/hooks/useAddresses';

export default function UserAddressesPage() {
  const { addresses, loading, deleteAddress, setDefaultAddress } = useAddresses();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('ต้องการลบที่อยู่นี้หรือไม่?')) return;
    setActionId(id);
    try {
      await deleteAddress(id);
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionId(id);
    try {
      await setDefaultAddress(id);
    } finally {
      setActionId(null);
    }
  };

  return (
    <AccountLayout title="ที่อยู่สำหรับจัดส่ง">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link href="/user/addresses/new">
            <Button>เพิ่มที่อยู่ใหม่</Button>
          </Link>
        </div>

        {loading ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : addresses.length === 0 ? (
          <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-12 text-center">
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีที่อยู่จัดส่ง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="sop-body-sm-medium text-sop-neutral-gray-200">
                        {address.label || 'ที่อยู่'}
                      </p>
                      {address.isDefault ? (
                        <span className="rounded-sop-8px bg-sop-primary-100 px-2 py-0.5 sop-body-xs-medium text-sop-primary-600">
                          ที่อยู่หลัก
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-300">
                      {address.fullName} · {address.phone}
                    </p>
                    <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-400">
                      {address.addressLine1}
                      {address.addressLine2 ? ` ${address.addressLine2}` : ''}
                      {address.tumbon ? ` ต.${address.tumbon}` : ''} อ.{address.amphoe} จ.
                      {address.province} {address.postalCode}
                    </p>
                  </div>
                  <Link
                    href={`/user/addresses/${address.id}/edit`}
                    className="sop-body-sm-medium text-sop-secondary-500 underline"
                  >
                    แก้ไข
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={actionId === address.id}
                      disabled={actionId === address.id}
                      onClick={() => void handleSetDefault(address.id)}
                    >
                      ตั้งเป็นที่อยู่หลัก
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={actionId === address.id}
                    disabled={actionId === address.id}
                    onClick={() => void handleDelete(address.id)}
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
