import { ProductReviewPagination } from '@/components/molecules/ProductReviewPagination/ProductReviewPagination';

type SellerStoreReviewPaginationProps = {
  page: number;
  totalPages: number;
  totalReviews: number;
  onPageChange: (page: number) => void;
};

export function SellerStoreReviewPagination({
  page,
  totalPages,
  onPageChange,
}: SellerStoreReviewPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4" data-testid="seller-store-review-pagination">
      <ProductReviewPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
