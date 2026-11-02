'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RenderReviewFilterButtons } from '@/components/molecules/RenderReviewFilterButtons/RenderReviewFilterButtons';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import {
  PRODUCT_REVIEWS_INITIAL_LIMIT,
  PRODUCT_REVIEWS_LOAD_MORE_STEP,
  PRODUCT_REVIEWS_MAX_LIMIT,
} from '@/lib/constants/listPageSize';
import type { ProductReview } from '@/lib/hooks/useReviews';
import { ProductReviewItem } from './ProductReviewItem';
import { StarCircleIcon } from '@/components/atoms/icons';

const RATING_QUERY_KEY = 'prf';

type ProductDetailsSellerReviewsProps = {
  productReviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  loading?: boolean;
  /** Ask the parent to refetch page 1 with this larger limit. */
  onLoadMore?: (nextLimit: number) => void;
  onFilterActiveChange?: (active: boolean) => void;
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
  onLoadMore,
  onFilterActiveChange,
}: ProductDetailsSellerReviewsProps) {
  const searchParams = useSearchParams();
  const [ratingFilter, setRatingFilter] = useState<string | null>(() =>
    searchParams.get(RATING_QUERY_KEY),
  );
  const [visibleCount, setVisibleCount] = useState(PRODUCT_REVIEWS_INITIAL_LIMIT);

  useEffect(() => {
    onFilterActiveChange?.(ratingFilter != null);
  }, [onFilterActiveChange, ratingFilter]);

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

  const remainingCount = ratingFilter
    ? filteredReviews.length - visibleCount
    : Math.max(filteredReviews.length, totalReviews) - visibleCount;
  const reachedReviewCap =
    !ratingFilter &&
    productReviews.length >= PRODUCT_REVIEWS_MAX_LIMIT &&
    visibleCount >= productReviews.length;
  const showLoadMore =
    remainingCount > 0 &&
    !reachedReviewCap &&
    (ratingFilter
      ? filteredReviews.length > visibleCount
      : productReviews.length >= visibleCount || filteredReviews.length > visibleCount);

  if (loading) {
    return (
      <div
        className="rounded-sop-16px bg-sop-base-white px-sop-16px py-4"
        data-testid="product-reviews-loading"
      >
        <div className="h-6 w-40 animate-pulse rounded bg-sop-neutral-gray-500" />
      </div>
    );
  }

  return (
    <div
      className="rounded-sop-16px bg-sop-base-white px-sop-16px py-4"
      data-testid="product-reviews"
    >
      <div className="flex items-center gap-sop-8px pb-sop-20px">
        <StarCircleIcon
          size={{ mobile: 32, desktop: 32 }}
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
              className="sop-headline-md-medium md:sop-display-sm-medium text-sop-neutral-gray-200"
              data-testid="store-review-average"
            >
              {averageRating.toFixed(1)}
            </p>
            <span className="sop-body-sm-regular text-sop-neutral-gray-400">/5</span>
          </div>
          <div className="flex items-center gap-2">
            <RenderStars averageRating={averageRating} size={16} />
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
              setVisibleCount(PRODUCT_REVIEWS_INITIAL_LIMIT);
            }}
          />
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <ReviewComments productReviews={visibleReviews} />
        {showLoadMore && (
          <div className="border-t border-sop-neutral-grayalpha-200 pt-6">
            <div className="flex justify-center">
              <button
                type="button"
                className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-sop-neutral-grayalpha-300 bg-white px-6 py-3 sop-body-sm-medium text-sop-neutral-gray-200 transition-colors hover:bg-sop-neutral-grayalpha-100"
                onClick={() => {
                  const nextVisibleCount = visibleCount + PRODUCT_REVIEWS_LOAD_MORE_STEP;
                  setVisibleCount(nextVisibleCount);
                  if (!ratingFilter) {
                    onLoadMore?.(Math.min(nextVisibleCount, PRODUCT_REVIEWS_MAX_LIMIT));
                  }
                }}
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
