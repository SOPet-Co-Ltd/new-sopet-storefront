import { SellerStoreReviewPagination } from '@/components/molecules/SellerStoreReviewPagination/SellerStoreReviewPagination';
import { SellerStoreReviewListItem } from '@/components/molecules/SellerStoreReviewListItem/SellerStoreReviewListItem';
import type { StoreReview } from '@/lib/hooks/useReviews';

const REVIEWS_PER_PAGE = 10;

type SellerStoreReviewListProps = {
  reviews: StoreReview[];
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function SellerStoreReviewList({
  reviews,
  currentPage,
  onPageChange,
}: SellerStoreReviewListProps) {
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReviews = reviews.slice(
    (safePage - 1) * REVIEWS_PER_PAGE,
    safePage * REVIEWS_PER_PAGE,
  );

  return (
    <div data-testid="seller-store-review-list">
      <ul className="divide-y">
        {paginatedReviews.map((review) => (
          <SellerStoreReviewListItem key={review.id} review={review} />
        ))}
      </ul>
      <SellerStoreReviewPagination
        page={safePage}
        totalPages={totalPages}
        totalReviews={reviews.length}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export { REVIEWS_PER_PAGE as SELLER_STORE_REVIEWS_PER_PAGE };
