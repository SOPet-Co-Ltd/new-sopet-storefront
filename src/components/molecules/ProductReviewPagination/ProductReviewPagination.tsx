'use client';

import { GreaterThanIcon } from '@/components/atoms/icons/filled/GreaterThanIcon';
import { LessThanIcon } from '@/components/atoms/icons/filled/LessThanIcon';

type ProductReviewPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPaginationButtons(page: number, totalPages: number): Array<number | '...'> {
  if (totalPages < 1) return [];

  const buttons: Array<number | '...'> = [];
  const range = 2;

  buttons.push(1);

  if (page > range + 2) {
    buttons.push('...');
  }

  for (let index = Math.max(2, page - range); index <= Math.min(totalPages - 1, page + range); index += 1) {
    buttons.push(index);
  }

  if (page < totalPages - (range + 1)) {
    buttons.push('...');
  }

  if (totalPages > 1) {
    buttons.push(totalPages);
  }

  return buttons;
}

export function ProductReviewPagination({
  page,
  totalPages,
  onPageChange,
}: ProductReviewPaginationProps) {
  if (totalPages <= 1) return null;

  const buttons = getPaginationButtons(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-4" data-testid="product-review-pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="หน้าก่อนหน้า"
      >
        <LessThanIcon
          size={{ mobile: 12, desktop: 18 }}
          color={page <= 1 ? '#22222947' : '#22222929'}
        />
      </button>

      <div className="flex gap-4">
        {buttons.map((label, index) =>
          typeof label === 'number' ? (
            <button
              key={`${label}-${index}`}
              type="button"
              disabled={label === page}
              onClick={() => onPageChange(label)}
              className="cursor-pointer aspect-square md:h-sop-28px md:w-sop-28px h-sop-20px w-sop-20px md:sop-body-md-light sop-body-xs-light rounded-md border border-sop-neutral-gray-300 text-sop-neutral-gray-300 disabled:bg-sop-neutral-gray-300 disabled:text-sop-base-white"
            >
              {label}
            </button>
          ) : (
            <span
              key={`${label}-${index}`}
              className="self-end text-center md:w-sop-20px w-sop-12px md:sop-body-md-light sop-body-xs-light cursor-default select-none"
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
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="หน้าถัดไป"
      >
        <GreaterThanIcon
          size={{ mobile: 12, desktop: 18 }}
          color={page >= totalPages ? '#22222947' : '#22222929'}
        />
      </button>
    </div>
  );
}
