import { SellerStoreReviewPagination } from '@/components/molecules/SellerStoreReviewPagination/SellerStoreReviewPagination';
import { SellerStoreReviewListItem } from '@/components/molecules/SellerStoreReviewListItem/SellerStoreReviewListItem';
import { STORE_REVIEWS_PAGE_SIZE } from '@/lib/constants/listPageSize';
import type { StoreReview } from '@/lib/hooks/useReviews';

type SellerStoreReviewListProps = {
  reviews: StoreReview[];
  storeSlug: string;
  currentPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function SellerStoreReviewList({
  reviews,
  storeSlug,
  currentPage,
  totalCount,
  onPageChange,
}: SellerStoreReviewListProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / STORE_REVIEWS_PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  return (
    <div data-testid="seller-store-review-list">
      <ul className="divide-y">
        {reviews.map((review) => (
          <SellerStoreReviewListItem key={review.id} review={review} storeSlug={storeSlug} />
        ))}
      </ul>
      <SellerStoreReviewPagination
        page={safePage}
        totalPages={totalPages}
        totalReviews={totalCount}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export { STORE_REVIEWS_PAGE_SIZE as SELLER_STORE_REVIEWS_PER_PAGE };
