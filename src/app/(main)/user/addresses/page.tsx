'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { AddressCard } from '@/components/molecules/AddressCard/AddressCard';
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
          <AccountCard padding="lg">
            <AccountEmptyState message="ยังไม่มีที่อยู่จัดส่ง" />
          </AccountCard>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <AccountCard key={address.id}>
                <AddressCard
                  address={address}
                  isActionLoading={actionId === address.id}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                />
              </AccountCard>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
