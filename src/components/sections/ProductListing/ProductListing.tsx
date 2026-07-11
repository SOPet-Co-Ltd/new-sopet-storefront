'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { Pagination } from '@/components/molecules/Pagination';
import { SearchSortBar, type SearchSortValue } from '@/components/molecules/SearchSortBar';
import ProductCard from '@/components/organisms/ProductCard';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import { useProducts } from '@/lib/hooks/useProducts';
import { useSearchContext } from '@/lib/hooks/useSearchContext';
import { useSessionId } from '@/lib/hooks/useSessionId';
import { parseSearchSort } from '@/lib/search/searchSort';
import { parseSearchFilters, toProductsFilterVariables } from '@/lib/search/searchFilters';
import { cn } from '@/lib/utils';
import { ProductListingSkeleton } from './ProductListingSkeleton';
import { PRODUCT_CARD_GRID_CLASS } from './productListingGrid';

const DEFAULT_PRODUCT_LIMIT = 24;
const SEARCH_PRODUCT_LIMIT = 40;

export type ProductListingProps = {
  category?: string;
  search?: string;
  storeId?: string;
  tag?: string;
  heading?: string;
  variant?: 'default' | 'search';
  limit?: number;
  initialProducts?: ProductsQuery['products']['items'];
  initialPage?: number;
};

export function ProductListing({
  category,
  search,
  storeId,
  tag,
  heading,
  variant = 'default',
  limit: limitProp,
  initialProducts,
  initialPage = 1,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? 1));
  const sortParam = searchParams.get('sort') as SearchSortValue | null;
  const searchFilters = parseSearchFilters(searchParams);
  const filterVariables = toProductsFilterVariables(searchFilters);
  const listingParamsKey = useMemo(
    () =>
      JSON.stringify({
        category: category ?? null,
        search: search ?? null,
        storeId: storeId ?? null,
        tag: tag ?? null,
        sort: sortParam,
        page: currentPage,
        ...filterVariables,
      }),
    [category, search, storeId, tag, sortParam, currentPage, filterVariables],
  );
  const initialListingParamsKeyRef = useRef(listingParamsKey);
  const listingParamsChanged = listingParamsKey !== initialListingParamsKeyRef.current;
  const { sortBy, sortOrder } =
    variant === 'search' ? parseSearchSort(sortParam) : { sortBy: undefined, sortOrder: undefined };
  const limit = limitProp ?? (variant === 'search' ? SEARCH_PRODUCT_LIMIT : DEFAULT_PRODUCT_LIMIT);
  const searchContext = useSearchContext();
  const sessionId = useSessionId(variant === 'search');

  const listingPrefetch = useMemo(
    () =>
      variant === 'search'
        ? {
            search,
            category,
            storeId,
            tag,
            limit,
            sortBy,
            sortOrder,
            sessionId,
            searchContext,
            ...filterVariables,
          }
        : { category, search, storeId, tag, limit, sortBy, sortOrder, ...filterVariables },
    [
      variant,
      search,
      category,
      storeId,
      tag,
      limit,
      sortBy,
      sortOrder,
      sessionId,
      searchContext,
      filterVariables,
    ],
  );

  const {
    products: fetchedProducts,
    total,
    totalPages,
    loading,
    error,
    refetch,
  } = useProducts({
    category,
    search,
    storeId,
    tag,
    ...filterVariables,
    page: currentPage,
    limit,
    sortBy,
    sortOrder,
    sessionId,
    searchContext,
  });

  const useInitialProducts =
    currentPage === initialPage && initialProducts !== undefined && !listingParamsChanged;
  const products =
    useInitialProducts && loading ? (initialProducts ?? fetchedProducts) : fetchedProducts;
  const showLoading = useInitialProducts ? !initialProducts && loading : loading;

  useEffect(() => {
    if (!listingPrefetch || totalPages <= 1 || currentPage >= totalPages) {
      return;
    }

    prefetchProductsListing({
      ...listingPrefetch,
      page: currentPage + 1,
    });
  }, [listingPrefetch, totalPages, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router, searchParams],
  );

  if (showLoading) {
    return <ProductListingSkeleton variant={variant} />;
  }

  if (error) {
    return (
      <div className="py-8 text-center" data-testid="product-listing-error">
        <p className="sop-body-md-regular text-sop-neutral-gray-300 mb-4">โหลดสินค้าไม่สำเร็จ</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    if (variant === 'search') {
      return (
        <div data-testid="product-listing">
          {heading && (
            <h1 className="sop-headline-md-medium text-sop-neutral-gray-300">{heading}</h1>
          )}
          <div className={cn(heading && 'mt-10')}>
            <SearchSortBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              listingPrefetch={listingPrefetch}
            />
          </div>
          <EmptySearchResults searchQuery={search} />
        </div>
      );
    }

    return <EmptySearchResults />;
  }

  if (variant === 'search') {
    return (
      <div data-testid="product-listing">
        {heading && <h1 className="sop-headline-md-medium text-sop-neutral-gray-300">{heading}</h1>}

        <div className={cn(heading && 'mt-10')}>
          <SearchSortBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            listingPrefetch={listingPrefetch}
          />
        </div>

        <div className="mt-6 pt-7">
          <p className="sop-body-lg-medium text-sop-neutral-gray-200">สินค้าทั้งหมด ({total})</p>

          <ul className={cn('mt-6', PRODUCT_CARD_GRID_CLASS)}>
            {products.map((product, index) => (
              <li key={product.id} className="min-w-0 flex justify-center">
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4" data-testid="product-listing">
      <div className="flex justify-between items-center mb-6">
        <div>
          {heading && (
            <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 mb-2">{heading}</h1>
          )}
          <p className="sop-body-lg-medium text-sop-neutral-gray-300">สินค้าทั้งหมด {total}</p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          listingPrefetch={listingPrefetch}
        />
      </div>

      <ul className={PRODUCT_CARD_GRID_CLASS}>
        {products.map((product, index) => (
          <li key={product.id} className="min-w-0 flex justify-center">
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center md:justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          listingPrefetch={listingPrefetch}
        />
      </div>
    </div>
  );
}
