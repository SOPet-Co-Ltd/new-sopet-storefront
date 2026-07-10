'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductReviewPagination } from '@/components/molecules/ProductReviewPagination/ProductReviewPagination';
import { RenderReviewFilterButtons } from '@/components/molecules/RenderReviewFilterButtons/RenderReviewFilterButtons';
import { RenderStars } from '@/components/molecules/RenderStars/RenderStars';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/lib/hooks/useReviews';
import { ProductReviewItem } from './ProductReviewItem';

const REVIEWS_PER_PAGE = 5;
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

function ReviewComments({ productReviews }: { productReviews: ProductReview[] }) {
  if (productReviews.length === 0) {
    return <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีรีวิว</p>;
  }

  return (
    <div className="flex flex-col gap-4">
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
  const [ratingFilter, setRatingFilter] = useState<string | null>(
    () => searchParams.get(RATING_QUERY_KEY),
  );
  const [currentPage, setCurrentPage] = useState(1);

  const starCounts = useMemo(() => computeStarCounts(productReviews), [productReviews]);
  const filteredReviews = useMemo(
    () => filterReviews(productReviews, ratingFilter),
    [productReviews, ratingFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice(
    (safePage - 1) * REVIEWS_PER_PAGE,
    safePage * REVIEWS_PER_PAGE,
  );

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
      <div className="border-b mb-4 py-2 border-sop-primary-500">
        <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-700">
          รีวิวจากลูกค้า
        </p>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] p-2 md:grid-rows-1 grid-cols-1 grid-rows-[auto_auto] bg-sop-primary-100 rounded-lg md:gap-12 gap-4">
        <div className="flex lg:justify-between md:justify-center justify-start items-center md:flex-col gap-2 md:bg-transparent">
          <p
            className="sop-headline-md-medium md:sop-display-sm-medium text-sop-system-warning-500"
            data-testid="store-review-average"
          >
            {averageRating}
          </p>
          <div className="md:flex hidden items-center gap-2">
            <RenderStars averageRating={averageRating} size={25} />
          </div>
          <div className="flex md:hidden items-center gap-2">
            <RenderStars averageRating={averageRating} size={19} />
          </div>
        </div>
        <div className={cn('md:bg-transparent bg-sop-primary-100')}>
          <RenderReviewFilterButtons
            starCounts={starCounts}
            totalReviews={totalReviews}
            selectedRating={ratingFilter}
            onFilterChange={(value) => {
              setRatingFilter(value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <ReviewComments productReviews={paginatedReviews} />
        <ProductReviewPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default function ProductDetailsSellerReviews(props: ProductDetailsSellerReviewsProps) {
  return (
    <Suspense fallback={<div data-testid="product-reviews-loading" className="h-24 animate-pulse" />}>
      <ProductDetailsSellerReviewsContent {...props} />
    </Suspense>
  );
}
