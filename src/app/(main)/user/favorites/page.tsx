'use client';

import { useState } from 'react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { FavoritesGrid } from '@/components/molecules/FavoritesGrid/FavoritesGrid';
import { useFavorites } from '@/lib/hooks/useFavorites';

export default function UserFavoritesPage() {
  const { favorites, loading, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFavorite(productId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AccountLayout title="รายการโปรด">
      {loading ? (
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
      ) : favorites.length === 0 ? (
        <AccountCard padding="lg">
          <AccountEmptyState
            cta={{ href: '/products', label: 'ไปเลือกซื้อสินค้า' }}
            message="ยังไม่มีสินค้าในรายการ"
          />
        </AccountCard>
      ) : (
        <FavoritesGrid
          favorites={favorites}
          loading={loading}
          onRemove={(id) => void handleRemove(id)}
          removingId={removingId}
        />
      )}
    </AccountLayout>
  );
}
