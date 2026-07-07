'use client';

import { useState } from 'react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
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
      <FavoritesGrid
        favorites={favorites}
        loading={loading}
        onRemove={(id) => void handleRemove(id)}
        removingId={removingId}
      />
    </AccountLayout>
  );
}
