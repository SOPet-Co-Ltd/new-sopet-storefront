'use client';

import { StarIcon } from '@/components/atoms/icons/filled/StarIcon';
import { useReviews } from '@/lib/hooks/useReviews';

type SellerReviewTabProps = {
  storeId: string;
};

function SellerReviewTabSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-4 mt-8 gap-4"
      aria-busy="true"
      data-testid="seller-review-tab-skeleton"
    >
      <div className="border rounded-xs p-4 h-48 bg-sop-neutral-gray-600 animate-pulse" />
      <div className="col-span-3 border rounded-xs p-4 h-48 bg-sop-neutral-gray-600 animate-pulse" />
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
    <div className="flex items-center flex-col sop-body-md-regular h-full py-12">
      <h3 className="sop-headline-sm-medium uppercase mb-2 text-sop-neutral-gray-300">
        Seller score
      </h3>
      <div className="flex gap-2 items-center mb-4 text-sop-neutral-gray-400">
        <StarIcon color="#ffb514" size={{ mobile: 16, desktop: 16 }} />
        <span>{averageRating.toFixed(1)}</span>
      </div>
      <p className="text-sop-neutral-gray-400">{totalCount} reviews</p>
    </div>
  );
}

export function SellerReviewTab({ storeId }: SellerReviewTabProps) {
  const { storeReviewSummary, loading, error } = useReviews({ storeId });

  if (loading) {
    return <SellerReviewTabSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8 text-center" data-testid="seller-review-tab-error">
        <p className="sop-body-md-regular text-sop-neutral-gray-300">โหลดรีวิวไม่สำเร็จ</p>
      </div>
    );
  }

  const summary = storeReviewSummary;
  const breakdown = summary?.productBreakdown ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 mt-8" data-testid="seller-review-tab">
      <div className="border rounded-xs p-4">
        <SellerScore
          averageRating={summary?.averageRating ?? 0}
          totalCount={summary?.totalCount ?? 0}
        />
      </div>
      <div className="col-span-3 border rounded-xs p-4">
        <h3 className="sop-headline-sm-medium uppercase border-b pb-4 text-sop-neutral-gray-300">
          Seller reviews
        </h3>
        {breakdown.length === 0 ? (
          <p className="sop-body-md-regular text-sop-neutral-gray-400 mt-4">ยังไม่มีรีวิว</p>
        ) : (
          <ul className="mt-4 divide-y">
            {breakdown.map((item) => (
              <li key={item.productId} className="py-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
                <div className="sm:w-1/4">
                  <p className="sop-body-md-medium text-sop-neutral-gray-300">{item.productName}</p>
                  <div className="flex gap-2 items-center mt-2 text-sop-neutral-gray-400">
                    <StarIcon color="#ffb514" size={{ mobile: 12, desktop: 12 }} />
                    <span className="sop-body-sm-regular">{item.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="sop-body-sm-regular text-sop-neutral-gray-400 sm:w-3/4">
                  {item.reviewCount} รีวิว
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
