'use client';

import { GreaterThanIcon } from '@/components/atoms/icons/filled/GreaterThanIcon';
import { LessThanIcon } from '@/components/atoms/icons/filled/LessThanIcon';
import { cn } from '@/lib/utils';

type ProductReviewPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function getPaginationButtons(page: number, totalPages: number): Array<number | '...'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, '...', page - 1, page, page + 1, '...', totalPages];
}

export function ProductReviewPagination({
  page,
  totalPages,
  onPageChange,
}: ProductReviewPaginationProps) {
  if (totalPages <= 1) return null;

  const buttons = getPaginationButtons(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-5" data-testid="product-review-pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-sop-28px w-sop-28px cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="หน้าก่อนหน้า"
      >
        <LessThanIcon
          size={{ mobile: 12, desktop: 18 }}
          color={page <= 1 ? '#22222947' : '#454547'}
        />
      </button>

      <div className="flex items-center gap-5">
        {buttons.map((label, index) =>
          typeof label === 'number' ? (
            <button
              key={`${label}-${index}`}
              type="button"
              aria-current={label === page ? 'page' : undefined}
              onClick={() => {
                if (label !== page) onPageChange(label);
              }}
              className={cn(
                'flex h-sop-28px w-sop-28px cursor-pointer items-center justify-center rounded-md border border-sop-neutral-gray-300 sop-body-sm-light text-sop-neutral-gray-300',
                label === page && 'cursor-default border-sop-neutral-gray-300 bg-sop-neutral-gray-300 text-sop-base-white',
              )}
            >
              {label}
            </button>
          ) : (
            <span
              key={`${label}-${index}`}
              className="w-sop-20px cursor-default select-none text-center sop-body-sm-light text-sop-neutral-gray-300"
            >
              {label}
            </span>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-sop-28px w-sop-28px cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="หน้าถัดไป"
      >
        <GreaterThanIcon
          size={{ mobile: 12, desktop: 18 }}
          color={page >= totalPages ? '#22222947' : '#454547'}
        />
      </button>
    </div>
  );
}
