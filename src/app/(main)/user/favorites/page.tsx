'use client';

import { useState } from 'react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { FavoritesGrid } from '@/components/molecules/FavoritesGrid/FavoritesGrid';
import { FAVORITES_PAGE_SIZE } from '@/lib/constants/listPageSize';
import { useFavorites } from '@/lib/hooks/useFavorites';

export default function UserFavoritesPage() {
  const [page, setPage] = useState(1);
  const { favorites, loading, removeFavorite, hasMore } = useFavorites({
    page,
    limit: FAVORITES_PAGE_SIZE,
  });
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
        <>
          <AccountCard padding="lg">
            <AccountEmptyState
              cta={{ href: '/products', label: 'ไปเลือกซื้อสินค้า' }}
              message={page === 1 ? 'ยังไม่มีสินค้าในรายการ' : 'ไม่มีรายการในหน้านี้'}
            />
          </AccountCard>
          <OffsetPageControls
            page={page}
            hasMore={hasMore}
            loading={loading}
            testId="favorites-pager"
            onPageChange={setPage}
          />
        </>
      ) : (
        <>
          <FavoritesGrid
            favorites={favorites}
            loading={loading}
            onRemove={(id) => void handleRemove(id)}
            removingId={removingId}
          />
          <OffsetPageControls
            page={page}
            hasMore={hasMore}
            loading={loading}
            testId="favorites-pager"
            onPageChange={setPage}
          />
        </>
      )}
    </AccountLayout>
  );
}

function OffsetPageControls({
  page,
  hasMore,
  loading,
  testId,
  onPageChange,
}: {
  page: number;
  hasMore: boolean;
  loading: boolean;
  testId: string;
  onPageChange: (page: number) => void;
}) {
  if (page <= 1 && !hasMore) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-4" data-testid={testId}>
      <button
        type="button"
        className="sop-body-sm-medium text-sop-secondary-500 underline disabled:cursor-not-allowed disabled:opacity-40"
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ก่อนหน้า
      </button>
      <span className="sop-body-sm-regular text-sop-neutral-gray-300">หน้า {page}</span>
      <button
        type="button"
        className="sop-body-sm-medium text-sop-secondary-500 underline disabled:cursor-not-allowed disabled:opacity-40"
        disabled={loading || !hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        ถัดไป
      </button>
    </div>
  );
}
