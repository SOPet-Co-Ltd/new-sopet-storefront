'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { SortUpDownIcon } from '@/components/atoms/icons/filled/SortUpDownIcon';
import { Pagination } from '@/components/molecules/Pagination';
import {
  prefetchProductsListing,
  type ProductsListingPrefetchParams,
} from '@/lib/catalog/prefetchProductsListing';
import { parseSearchSort } from '@/lib/search/searchSort';

export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance', label: 'ความเกี่ยวข้อง' },
  { value: 'best-sellers', label: 'สินค้าขายดี' },
  { value: 'price-asc', label: 'ราคาต่ำไปสูง' },
  { value: 'price-desc', label: 'ราคาสูงไปต่ำ' },
  { value: 'rating-asc', label: 'คะแนนรีวิวต่ำไปสูง' },
  { value: 'rating-desc', label: 'คะแนนรีวิวสูงไปต่ำ' },
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]['value'];

type SearchSortBarProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  listingPrefetch?: Omit<ProductsListingPrefetchParams, 'sortBy' | 'sortOrder' | 'page'>;
};

function buildSortHref(
  pathname: string,
  searchParams: URLSearchParams,
  sort: SearchSortValue,
): string {
  const params = new URLSearchParams(searchParams.toString());

  if (sort === 'relevance') {
    params.delete('sort');
  } else {
    params.set('sort', sort);
  }

  params.delete('page');

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SearchSortBar({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  listingPrefetch,
}: SearchSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = (searchParams.get('sort') as SearchSortValue | null) ?? 'relevance';

  const handleSortChange = useCallback(
    (sort: SearchSortValue) => {
      router.push(buildSortHref(pathname, searchParams, sort));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router, searchParams],
  );

  const handleSortPrefetch = useCallback(
    (sort: SearchSortValue) => {
      if (sort === activeSort) return;

      router.prefetch(buildSortHref(pathname, searchParams, sort));

      if (!listingPrefetch) return;

      const { sortBy, sortOrder } = parseSearchSort(sort);
      prefetchProductsListing({
        ...listingPrefetch,
        sortBy,
        sortOrder,
        page: 1,
      });
    },
    [activeSort, listingPrefetch, pathname, router, searchParams],
  );

  return (
    <div
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      data-testid="search-sort-bar"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5 py-1.5">
          <SortUpDownIcon size={{ mobile: 24, desktop: 24 }} color="#454547" />
          <span className="sop-body-sm-light text-sop-neutral-gray-200">เรียงตาม</span>
        </div>

        {SEARCH_SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            rounded="rounded"
            variant={activeSort === option.value ? 'primary' : 'neutral'}
            disabled={disabled}
            onClick={() => handleSortChange(option.value)}
            onMouseEnter={() => handleSortPrefetch(option.value)}
            onFocus={() => handleSortPrefetch(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={disabled}
        alwaysShow
        listingPrefetch={
          listingPrefetch
            ? {
                ...listingPrefetch,
                ...parseSearchSort(activeSort),
              }
            : undefined
        }
      />
    </div>
  );
}
