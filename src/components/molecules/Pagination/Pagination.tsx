'use client';

import { useCallback } from 'react';
import { LeftPointSquareIcon } from '@/components/atoms/icons/filled/LeftPointSquareIcon';
import { RightPointSquareIcon } from '@/components/atoms/icons/filled/RightPointSquareIcon';
import {
  prefetchProductsListing,
  type ProductsListingPrefetchParams,
} from '@/lib/catalog/prefetchProductsListing';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  alwaysShow?: boolean;
  listingPrefetch?: Omit<ProductsListingPrefetchParams, 'page'>;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  alwaysShow = false,
  listingPrefetch,
}: PaginationProps) {
  const resolvedTotalPages = Math.max(totalPages, 1);

  const handlePagePrefetch = useCallback(
    (page: number) => {
      if (disabled || !listingPrefetch || page < 1) return;
      prefetchProductsListing({
        ...listingPrefetch,
        page,
      });
    },
    [disabled, listingPrefetch],
  );

  if (!alwaysShow && totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= resolvedTotalPages;

  return (
    <div className="flex shrink-0 items-center gap-1 py-1.5" aria-label="การแบ่งหน้า">
      <button
        type="button"
        disabled={disabled || isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        onMouseEnter={() => {
          if (!isFirstPage) handlePagePrefetch(currentPage - 1);
        }}
        onFocus={() => {
          if (!isFirstPage) handlePagePrefetch(currentPage - 1);
        }}
        className="cursor-pointer border-none disabled:cursor-not-allowed"
        aria-label="หน้าก่อนหน้า"
      >
        <LeftPointSquareIcon
          size={{ mobile: 28, desktop: 28 }}
          color={disabled || isFirstPage ? '#22222947' : '#454547'}
        />
      </button>

      <p className="sop-body-sm-regular whitespace-nowrap">
        <span className="text-sop-neutral-gray-300">หน้า {currentPage}</span>
        <span className="text-sop-neutral-grayalpha-400">/{resolvedTotalPages}</span>
      </p>

      <button
        type="button"
        disabled={disabled || isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        onMouseEnter={() => {
          if (!isLastPage) handlePagePrefetch(currentPage + 1);
        }}
        onFocus={() => {
          if (!isLastPage) handlePagePrefetch(currentPage + 1);
        }}
        className="cursor-pointer border-none disabled:cursor-not-allowed"
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
