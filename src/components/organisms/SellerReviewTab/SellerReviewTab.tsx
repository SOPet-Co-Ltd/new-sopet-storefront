'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/atoms/icons/filled/StarIcon';
import { SellerStoreReviewList } from '@/components/molecules/SellerStoreReviewList/SellerStoreReviewList';
import { useReviews } from '@/lib/hooks/useReviews';

type SellerReviewTabProps = {
  storeId: string;
};

function SellerReviewTabSkeleton() {
  return (
    <div
      className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-4"
      aria-busy="true"
      data-testid="seller-review-tab-skeleton"
    >
      <div className="h-48 animate-pulse rounded-xs border bg-sop-neutral-gray-600 p-4" />
      <div className="col-span-3 h-48 animate-pulse rounded-xs border bg-sop-neutral-gray-600 p-4" />
    </div>
  );
}

function SellerScore({
  averageRating,
  totalCount,
}: {
  averageRating: number;
  totalCount: number;
}) {
  return (
    <div className="flex h-full flex-col items-center py-12 sop-body-md-regular">
      <h3 className="sop-headline-sm-medium mb-2 uppercase text-sop-neutral-gray-300">Seller score</h3>
      <div className="mb-4 flex items-center gap-2 text-sop-neutral-gray-400">
        <StarIcon color="#ffb514" size={{ mobile: 16, desktop: 16 }} />
        <span>{averageRating.toFixed(1)}</span>
      </div>
      <p className="text-sop-neutral-gray-400">{totalCount} reviews</p>
    </div>
  );
}

export function SellerReviewTab({ storeId }: SellerReviewTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    storeReviewSummary,
    storeReviews,
    storeReviewSummaryLoading,
    storeReviewsLoading,
    storeReviewsError,
    refetchStoreReviews,
  } = useReviews({ storeId });

  if (storeReviewSummaryLoading && storeReviewsLoading) {
    return <SellerReviewTabSkeleton />;
  }

  const summary = storeReviewSummary;

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-4" data-testid="seller-review-tab">
      <div className="rounded-xs border p-4">
        <SellerScore
          averageRating={summary?.averageRating ?? 0}
          totalCount={summary?.totalCount ?? 0}
        />
      </div>
      <div className="col-span-3 rounded-xs border p-4">
        <h3 className="sop-headline-sm-medium border-b pb-4 uppercase text-sop-neutral-gray-300">
          รีวิวจากลูกค้า
        </h3>
        {storeReviewsLoading ? (
          <p className="mt-4 sop-body-md-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : storeReviewsError ? (
          <div className="mt-4 text-center" data-testid="seller-review-tab-error">
            <p className="sop-body-md-regular text-sop-neutral-gray-300">โหลดรีวิวไม่สำเร็จ</p>
            <button
              type="button"
              className="mt-2 sop-body-sm-medium text-sop-primary-700"
              onClick={() => refetchStoreReviews()}
            >
              ลองโหลดอีกครั้ง
            </button>
          </div>
        ) : storeReviews.length === 0 ? (
          <p className="mt-4 sop-body-md-regular text-sop-neutral-gray-400">ยังไม่มีรีวิว</p>
        ) : (
          <div className="mt-4">
            <SellerStoreReviewList
              reviews={storeReviews}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
