'use client';

import { LeftPointSquareIcon } from '@/components/atoms/icons/filled/LeftPointSquareIcon';
import { RightPointSquareIcon } from '@/components/atoms/icons/filled/RightPointSquareIcon';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex items-center gap-1" aria-label="การแบ่งหน้า">
      <button
        type="button"
        disabled={disabled || isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="border-none cursor-pointer disabled:cursor-not-allowed"
        aria-label="หน้าก่อนหน้า"
      >
        <LeftPointSquareIcon
          size={{ mobile: 28, desktop: 28 }}
          color={disabled || isFirstPage ? '#22222947' : '#454547'}
        />
      </button>

      <div className="flex items-center">
        <p className="sop-body-sm-regular pr-2">หน้า</p>
        <p className="sop-body-sm-regular">{currentPage}</p>
        <p className="sop-body-sm-regular text-sop-neutral-grayalpha-400">/</p>
        <p className="sop-body-sm-regular text-sop-neutral-grayalpha-400">{totalPages}</p>
      </div>

      <button
        type="button"
        disabled={disabled || isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="border-none cursor-pointer disabled:cursor-not-allowed"
        aria-label="หน้าถัดไป"
      >
        <RightPointSquareIcon
          size={{ mobile: 28, desktop: 28 }}
          color={disabled || isLastPage ? '#22222947' : '#454547'}
        />
      </button>
    </div>
  );
}
