'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { Pagination } from '@/components/molecules/Pagination';
import { SearchSortBar, type SearchSortValue } from '@/components/molecules/SearchSortBar';
import ProductCard, {
  getProductCardCheapestVariantId,
  getProductCardDisplayPrice,
} from '@/components/organisms/ProductCard';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import { useCampaignCompareAtLookup } from '@/lib/hooks/useCampaignCompareAtLookup';
import { useProducts } from '@/lib/hooks/useProducts';
import { useSearchContext } from '@/lib/hooks/useSearchContext';
import { useSessionId } from '@/lib/hooks/useSessionId';
import { parseListingPageParam } from '@/lib/search/parseListingPageParam';
import { parseSearchSort } from '@/lib/search/searchSort';
import { parseSearchFilters, toProductsFilterVariables } from '@/lib/search/searchFilters';
import { cn } from '@/lib/utils';
import { ProductListingSkeleton } from './ProductListingSkeleton';
import { PRODUCT_CARD_GRID_CLASS } from './productListingGrid';
import { resolveListingTotal, resolveListingTotalPages } from './resolveListingPagination';

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
  initialTotal?: number;
  initialTotalPages?: number;
  initialPage?: number;
  skip?: boolean;
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
  initialTotal,
  initialTotalPages,
  initialPage = 1,
  skip = false,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPage = parseListingPageParam(searchParams.get('page'));
  const sortParam = searchParams.get('sort') as SearchSortValue | null;
  const searchFilters = parseSearchFilters(searchParams);
  const filterVariables = toProductsFilterVariables(searchFilters);
  const effectiveTag = tag ?? filterVariables.tag;
  const listingParamsKey = useMemo(
    () =>
      JSON.stringify({
        category: category ?? null,
        search: search ?? null,
        storeId: storeId ?? null,
        tag: effectiveTag ?? null,
        sort: sortParam,
        page: requestedPage,
        petTypeIds: filterVariables.petTypeIds ?? null,
        brandIds: filterVariables.brandIds ?? null,
        minPrice: filterVariables.minPrice ?? null,
        maxPrice: filterVariables.maxPrice ?? null,
      }),
    [category, search, storeId, effectiveTag, sortParam, requestedPage, filterVariables],
  );
  const [initialListingParamsKey] = useState(listingParamsKey);
  const listingParamsChanged = listingParamsKey !== initialListingParamsKey;
  // Category PLP shares search sort controls; seller store listings stay unsorted.
  const enableSort = variant === 'search' || (Boolean(category) && !storeId);
  const { sortBy, sortOrder } = enableSort
    ? parseSearchSort(sortParam)
    : { sortBy: undefined, sortOrder: undefined };
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
            tag: effectiveTag,
            limit,
            sortBy,
            sortOrder,
            sessionId,
            searchContext,
            ...filterVariables,
          }
        : {
            category,
            search,
            storeId,
            tag: effectiveTag,
            limit,
            sortBy,
            sortOrder,
            ...filterVariables,
          },
    [
      variant,
      search,
      category,
      storeId,
      effectiveTag,
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
    total: fetchedTotal,
    totalPages: fetchedTotalPages,
    hasPagination,
    loading,
    error,
    refetch,
  } = useProducts({
    category,
    search,
    storeId,
    ...filterVariables,
    tag: effectiveTag,
    page: requestedPage,
    limit,
    sortBy,
    sortOrder,
    sessionId,
    searchContext,
    skip,
  });

  const useInitialProducts =
    requestedPage === initialPage && initialProducts !== undefined && !listingParamsChanged;
  const products =
    useInitialProducts && loading ? (initialProducts ?? fetchedProducts) : fetchedProducts;
  const showLoading = useInitialProducts ? !initialProducts && loading : loading;
  const total = resolveListingTotal({
    hasPagination,
    useInitialProducts,
    fetchedTotal,
    initialTotal,
  });
  const totalPages = resolveListingTotalPages({
    hasPagination,
    useInitialProducts,
    fetchedTotalPages,
    initialTotalPages,
  });
  // Clamp the displayed page once totalPages is known (avoids "หน้า 999/2").
  const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage;

  const productIds = useMemo(() => products.map((product) => product.id), [products]);
  const { getCampaignPricing } = useCampaignCompareAtLookup(productIds);

  useEffect(() => {
    if (totalPages < 1 || requestedPage <= totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (totalPages <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(totalPages));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [totalPages, requestedPage, pathname, router, searchParams]);

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
    if (enableSort) {
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

  if (enableSort) {
    const totalLabel = variant === 'search' ? `สินค้าทั้งหมด (${total})` : `สินค้าทั้งหมด ${total}`;

    return (
      <div className={cn(variant !== 'search' && 'py-4')} data-testid="product-listing">
        {heading && <h1 className="sop-headline-md-medium text-sop-neutral-gray-300">{heading}</h1>}

        <div className={cn(heading && 'mt-10')}>
          <SearchSortBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            listingPrefetch={listingPrefetch}
          />
        </div>

        <div className={cn('mt-6', variant === 'search' && 'pt-7')}>
          <p
            className={cn(
              'sop-body-lg-medium',
              variant === 'search' ? 'text-sop-neutral-gray-200' : 'text-sop-neutral-gray-300',
            )}
          >
            {totalLabel}
          </p>

          <ul className={cn('mt-6', PRODUCT_CARD_GRID_CLASS)}>
            {products.map((product, index) => {
              const catalogPrice = getProductCardDisplayPrice(product);
              const pricing = getCampaignPricing(
                product.id,
                getProductCardCheapestVariantId(product),
                catalogPrice,
              );
              return (
                <li key={product.id} className="min-w-0">
                  <ProductCard
                    product={product}
                    priority={index < 4}
                    campaignCompareAt={pricing?.compareAt ?? null}
                    campaignSalePrice={pricing?.saleUnit ?? null}
                  />
                </li>
              );
            })}
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
        {products.map((product, index) => {
          const catalogPrice = getProductCardDisplayPrice(product);
          const pricing = getCampaignPricing(
            product.id,
            getProductCardCheapestVariantId(product),
            catalogPrice,
          );
          return (
            <li key={product.id} className="min-w-0">
              <ProductCard
                product={product}
                priority={index < 4}
                campaignCompareAt={pricing?.compareAt ?? null}
                campaignSalePrice={pricing?.saleUnit ?? null}
              />
            </li>
          );
        })}
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
