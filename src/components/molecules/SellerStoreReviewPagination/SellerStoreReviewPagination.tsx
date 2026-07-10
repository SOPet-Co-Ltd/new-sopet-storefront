type SellerStoreReviewPaginationProps = {
  page: number;
  totalPages: number;
  totalReviews: number;
  onPageChange: (page: number) => void;
};

export function SellerStoreReviewPagination({
  page,
  totalPages,
  totalReviews,
  onPageChange,
}: SellerStoreReviewPaginationProps) {
  if (totalReviews <= 10) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2" data-testid="seller-store-review-pagination">
      <button
        type="button"
        className="rounded-sop-8px border border-sop-neutral-grayalpha-200 px-3 py-1 sop-body-sm-regular text-sop-neutral-gray-300 disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ก่อนหน้า
      </button>
      <span className="sop-body-sm-regular text-sop-neutral-gray-400">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded-sop-8px border border-sop-neutral-grayalpha-200 px-3 py-1 sop-body-sm-regular text-sop-neutral-gray-300 disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ถัดไป
      </button>
    </div>
  );
}
