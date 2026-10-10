'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductReviewPagination } from '@/components/molecules/ProductReviewPagination/ProductReviewPagination';
import { RenderReviewFilterButtons } from '@/components/molecules/RenderReviewFilterButtons/RenderReviewFilterButtons';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/lib/hooks/useReviews';
import { ProductReviewItem } from './ProductReviewItem';
import { StarIcon } from '@/components/atoms/icons';

const REVIEWS_PER_PAGE = 10;
const RATING_QUERY_KEY = 'prf';

type ProductDetailsSellerReviewsProps = {
  productReviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  loading?: boolean;
};

function computeStarCounts(reviews: ProductReview[]) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[rating] += 1;
  }

  return counts;
}

function filterReviews(reviews: ProductReview[], filter: string | null): ProductReview[] {
  if (!filter) return reviews;

  if (['1', '2', '3', '4', '5'].includes(filter)) {
    const rating = Number(filter);
    return reviews.filter((review) => Math.round(review.rating) === rating);
  }

  if (filter === 'wi') {
    return reviews.filter((review) => (review.images?.length ?? 0) > 0);
  }

  if (filter === 'oc') {
    return reviews.filter((review) => Boolean(review.comment?.trim()));
  }

  return reviews;
}

function formatReviewCount(count: number): string {
  if (count < 1000) return String(count);
  const k = count / 1000;
  return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

function ReviewComments({ productReviews }: { productReviews: ProductReview[] }) {
  if (productReviews.length === 0) {
    return <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีรีวิว</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-sop-neutral-grayalpha-200">
      {productReviews.map((review) => (
        <ProductReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

function ProductDetailsSellerReviewsContent({
  productReviews,
  averageRating,
  totalReviews,
  loading = false,
}: ProductDetailsSellerReviewsProps) {
  const searchParams = useSearchParams();
  const [ratingFilter, setRatingFilter] = useState<string | null>(() =>
    searchParams.get(RATING_QUERY_KEY),
  );
  const [visibleCount, setVisibleCount] = useState(4);

  const starCounts = useMemo(() => computeStarCounts(productReviews), [productReviews]);
  const withImageCount = useMemo(
    () => productReviews.filter((r) => (r.images?.length ?? 0) > 0).length,
    [productReviews],
  );
  const withCommentCount = useMemo(
    () => productReviews.filter((r) => Boolean(r.comment?.trim())).length,
    [productReviews],
  );
  const filteredReviews = useMemo(
    () => filterReviews(productReviews, ratingFilter),
    [productReviews, ratingFilter],
  );

  const visibleReviews = useMemo(() => {
    return filteredReviews.slice(0, visibleCount);
  }, [filteredReviews, visibleCount]);

  const remainingCount = filteredReviews.length - visibleCount;

  if (loading) {
    return (
      <div
        className="-mx-4 bg-sop-base-white p-4 rounded-none md:mx-0 md:rounded-sop-16px"
        data-testid="product-reviews-loading"
      >
        <div className="h-6 w-40 animate-pulse rounded bg-sop-neutral-gray-500" />
      </div>
    );
  }

  return (
    <div
      className="-mx-4 bg-sop-base-white p-4 rounded-none md:mx-0 md:rounded-sop-16px"
      data-testid="product-reviews"
    >
      <div className="flex items-center gap-sop-8px pb-sop-20px">
        <StarIcon
          size={{ mobile: 24, desktop: 32 }}
          color="#FFFFFF"
          className="p-sop-8px bg-sop-primary-500 rounded-full"
        />
        <h2 className="sop-body-md-medium lg:sop-body-md-medium">
          รีวิวจากคนรักสัตว์เลี้ยง ({formatReviewCount(totalReviews)})
        </h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-sop-primary-100 p-4 md:min-w-[173px] md:shrink-0 md:p-6">
          <div className="flex items-baseline gap-1">
            <p
              className="sop-headline-md-medium md:sop-display-sm-medium text-sop-system-warning-500"
              data-testid="store-review-average"
            >
              {averageRating.toFixed(1)}
            </p>
            <span className="sop-body-sm-regular text-sop-neutral-gray-400">/5</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <RenderStars averageRating={averageRating} size={25} />
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <RenderStars averageRating={averageRating} size={19} />
          </div>
        </div>

        <div className="md:flex-1 md:self-center">
          <RenderReviewFilterButtons
            starCounts={starCounts}
            totalReviews={totalReviews}
            withImageCount={withImageCount}
            withCommentCount={withCommentCount}
            selectedRating={ratingFilter}
            onFilterChange={(value) => {
              setRatingFilter(value);
              setVisibleCount(4);
            }}
          />
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <ReviewComments productReviews={visibleReviews} />
        {remainingCount > 0 && (
          <div className="border-t border-sop-neutral-grayalpha-200 pt-6">
            <div className="flex justify-center">
              <button
                type="button"
                className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-sop-neutral-grayalpha-300 bg-white px-6 py-3 sop-body-md-medium text-sop-neutral-gray-200 transition-colors hover:bg-sop-neutral-grayalpha-100"
                onClick={() => setVisibleCount((prev) => prev + 10)}
              >
                ดูรีวิวเพิ่มเติม ({remainingCount.toLocaleString()})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailsSellerReviews(props: ProductDetailsSellerReviewsProps) {
  return (
    <Suspense
      fallback={<div data-testid="product-reviews-loading" className="h-24 animate-pulse" />}
    >
      <ProductDetailsSellerReviewsContent {...props} />
    </Suspense>
  );
}
