'use client';

import Image from 'next/image';
import { ReviewStarIcon } from '@/components/atoms/icons/filled/ReviewStarIcon';
import type { ProductReview } from '@/lib/hooks/useReviews';
import type { StoreReviewSummary } from '@/lib/hooks/useReviews';

type ProductDetailsSellerReviewsProps = {
  productReviews: ProductReview[];
  storeReviewSummary: StoreReviewSummary | null;
  loading?: boolean;
};

function formatReviewDate(createdAt: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(createdAt));
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`คะแนน ${rating} จาก 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <ReviewStarIcon
          key={index}
          size={{ mobile: 14, desktop: 14 }}
          filled={index < rating}
        />
      ))}
    </div>
  );
}

export default function ProductDetailsSellerReviews({
  productReviews,
  storeReviewSummary,
  loading = false,
}: ProductDetailsSellerReviewsProps) {
  if (loading) {
    return (
      <div className="bg-sop-base-white p-4 md:rounded-lg rounded-none md:mt-5 mt-2" data-testid="product-reviews-loading">
        <div className="h-6 w-40 animate-pulse rounded bg-sop-neutral-gray-500" />
      </div>
    );
  }

  const averageRating = storeReviewSummary?.averageRating ?? 0;
  const totalCount = storeReviewSummary?.totalCount ?? 0;

  return (
    <div
      className="bg-sop-base-white gap-4 p-4 md:rounded-lg rounded-none md:mt-5 mt-2"
      data-testid="product-reviews"
    >
      <div className="border-b mb-4 py-2 border-sop-primary-500">
        <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-700">
          รีวิวจากลูกค้า
        </p>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] p-2 bg-sop-primary-100 rounded-lg md:gap-12 gap-4 mb-4">
        <div className="flex items-center md:flex-col gap-2">
          <p className="sop-headline-md-medium text-sop-system-warning-500" data-testid="store-review-average">
            {averageRating.toFixed(1)}
          </p>
          <ReviewStars rating={Math.round(averageRating)} />
        </div>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400 self-center">
          รีวิวทั้งหมด {totalCount} รายการ
        </p>
      </div>

      {productReviews.length === 0 ? (
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีรีวิว</p>
      ) : (
        <div className="flex flex-col gap-4">
          {productReviews.map((review) => (
            <article key={review.id} className="border-b border-sop-neutral-grayalpha-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="sop-body-sm-medium text-sop-neutral-gray-300">{review.customerName}</p>
                <time className="sop-body-xs-regular text-sop-neutral-gray-400" dateTime={review.createdAt}>
                  {formatReviewDate(review.createdAt)}
                </time>
              </div>
              <ReviewStars rating={review.rating} />
              {review.comment && (
                <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">{review.comment}</p>
              )}
              {review.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {review.images.map((image) => (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt=""
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-sop-8px object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
