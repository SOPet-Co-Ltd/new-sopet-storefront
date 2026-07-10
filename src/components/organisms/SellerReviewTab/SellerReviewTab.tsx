'use client';

import { useState } from 'react';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { SellerStoreReviewList } from '@/components/molecules/SellerStoreReviewList/SellerStoreReviewList';
import { useReviews } from '@/lib/hooks/useReviews';

type SellerReviewTabProps = {
  storeId: string;
};

function SellerReviewTabSkeleton() {
  return (
    <div
      className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,3fr)] lg:gap-6"
      aria-busy="true"
      data-testid="seller-review-tab-skeleton"
    >
      <div className="min-h-sop-160px animate-pulse rounded-sop-8 bg-sop-neutral-gray-600" />
      <div className="min-h-sop-160px animate-pulse rounded-sop-8 bg-sop-neutral-gray-600" />
    </div>
  );
}

function SellerScorePanel({
  averageRating,
  totalCount,
}: {
  averageRating: number;
  totalCount: number;
}) {
  return (
    <div className="flex min-h-sop-160px flex-col items-center justify-center gap-2 rounded-sop-8 bg-sop-primary-100 p-4 md:p-6">
      <h3 className="sop-headline-sm-medium text-sop-neutral-gray-300">คะแนนร้านค้า</h3>
      <p className="sop-headline-md-medium md:sop-display-sm-medium text-sop-system-warning-500">
        {averageRating.toFixed(1)}
      </p>
      <div className="hidden items-center gap-2 md:flex">
        <RenderStars averageRating={averageRating} size={25} />
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <RenderStars averageRating={averageRating} size={19} />
      </div>
      <p className="sop-body-sm-regular text-sop-neutral-gray-400">{totalCount} รีวิว</p>
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
    <div
      className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(200px,1fr)_minmax(0,3fr)] lg:gap-6"
      data-testid="seller-review-tab"
    >
      <SellerScorePanel
        averageRating={summary?.averageRating ?? 0}
        totalCount={summary?.totalCount ?? 0}
      />
      <div>
        <div className="mb-4 border-b border-sop-primary-500 py-2">
          <h3 className="sop-headline-sm-medium md:sop-headline-md-medium text-sop-primary-700">
            รีวิวจากลูกค้า
          </h3>
        </div>
        {storeReviewsLoading ? (
          <p className="sop-body-md-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : storeReviewsError ? (
          <div className="text-center" data-testid="seller-review-tab-error">
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
          <p className="sop-body-md-regular text-sop-neutral-gray-400">ยังไม่มีรีวิว</p>
        ) : (
          <SellerStoreReviewList
            reviews={storeReviews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
