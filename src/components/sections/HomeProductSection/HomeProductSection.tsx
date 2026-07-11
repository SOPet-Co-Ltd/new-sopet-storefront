'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import { useProducts, type ProductListItem } from '@/lib/hooks/useProducts';
import { buildSearchContextInput, useSearchContext } from '@/lib/hooks/useSearchContext';
import { useSessionId } from '@/lib/hooks/useSessionId';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/organisms/ProductCard';
import { PRODUCT_CARD_GRID_CLASS } from '@/components/sections/ProductListing/productListingGrid';

const SECTION_HEADING_CLASS = 'mb-5 sop-body-lg-medium text-sop-neutral-gray-200';
const GRID_LAYOUT_MAX_PRODUCTS = 5;
const CAROUSEL_LAYOUT_MAX_PRODUCTS = 10;

const RESPONSIVE_GRID_COLUMNS =
  'md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-10';

const PRODUCT_CAROUSEL_CLASS = `flex gap-4 overflow-x-auto md:grid md:justify-items-center md:overflow-visible ${RESPONSIVE_GRID_COLUMNS}`;

function getGridProductVisibilityClass(index: number): string | undefined {
  if (index < 2) return undefined;
  if (index === 2) return 'hidden md:block';
  if (index === 3) return 'hidden lg:block';
  if (index === 4) return 'hidden xl:block';
  return 'hidden';
}

function ProductSkeletonRow() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 md:px-0" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] w-[168px] shrink-0 rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse md:w-[223px]"
        />
      ))}
    </div>
  );
}

type ReferenceProduct = {
  id: string;
  category?: string | null;
  tags?: string[];
  storeId?: string;
};

type HomeProductSectionProps = {
  heading?: string;
  viewAllHref?: string;
  storeId?: string;
  excludeProductId?: string;
  excludeStoreId?: string;
  sameStoreOnly?: boolean;
  referenceProduct?: ReferenceProduct;
  layout?: 'carousel' | 'grid';
};

function usePersonalizedSearchContext(referenceProductId?: string) {
  const sessionSearchContext = useSearchContext();

  return useMemo(() => {
    if (!referenceProductId) {
      return sessionSearchContext;
    }

    return buildSearchContextInput({
      recentQueries: sessionSearchContext?.recentQueries ?? [],
      recentProductIds: [referenceProductId, ...(sessionSearchContext?.recentProductIds ?? [])],
    });
  }, [referenceProductId, sessionSearchContext]);
}

function buildPersonalizedListingFilters(referenceProduct: ReferenceProduct) {
  const category = referenceProduct.category ?? undefined;
  const tag = category ? undefined : referenceProduct.tags?.[0];

  return { category, tag };
}

function getVisibleProducts(
  products: ProductListItem[],
  {
    storeId,
    excludeProductId,
    excludeStoreId,
    sameStoreOnly,
  }: Pick<
    HomeProductSectionProps,
    'storeId' | 'excludeProductId' | 'excludeStoreId' | 'sameStoreOnly'
  >,
) {
  return products.filter((product) => {
    if (excludeProductId && product.id === excludeProductId) {
      return false;
    }
    if (excludeStoreId && product.storeId === excludeStoreId) {
      return false;
    }
    if (sameStoreOnly && storeId && product.storeId !== storeId) {
      return false;
    }
    return true;
  });
}

export function HomeProductSection({
  heading = 'สินค้ามาใหม่',
  viewAllHref = '/products',
  storeId,
  excludeProductId,
  excludeStoreId,
  sameStoreOnly = false,
  referenceProduct,
  layout = 'carousel',
}: HomeProductSectionProps) {
  const productLimit = layout === 'grid' ? GRID_LAYOUT_MAX_PRODUCTS : CAROUSEL_LAYOUT_MAX_PRODUCTS;
  const resolvedExcludeProductId = excludeProductId ?? referenceProduct?.id;
  const personalizedFilters = referenceProduct
    ? buildPersonalizedListingFilters(referenceProduct)
    : null;
  const fetchLimit = resolvedExcludeProductId || excludeStoreId ? productLimit + 6 : productLimit;
  const sessionId = useSessionId(Boolean(referenceProduct));
  const searchContext = usePersonalizedSearchContext(referenceProduct?.id);
  const personalizedListingParams = referenceProduct
    ? {
        limit: fetchLimit,
        page: 1,
        category: personalizedFilters?.category,
        tag: personalizedFilters?.tag,
        sortBy: 'soldCount' as const,
        sortOrder: 'DESC' as const,
        sessionId,
        searchContext,
      }
    : null;
  const { products, loading, error } = useProducts({
    limit: fetchLimit,
    page: 1,
    storeId: storeId ?? undefined,
    category: personalizedListingParams?.category,
    tag: personalizedListingParams?.tag,
    sortBy: personalizedListingParams?.sortBy,
    sortOrder: personalizedListingParams?.sortOrder,
    sessionId: personalizedListingParams?.sessionId,
    searchContext: personalizedListingParams?.searchContext,
    skip: sameStoreOnly && !storeId,
  });

  const primaryVisibleProducts = getVisibleProducts(products, {
    storeId,
    excludeProductId: resolvedExcludeProductId,
    excludeStoreId,
    sameStoreOnly,
  });

  const shouldFetchFallback = Boolean(
    referenceProduct && !loading && primaryVisibleProducts.length === 0,
  );

  const {
    products: fallbackProducts,
    loading: fallbackLoading,
    error: fallbackError,
  } = useProducts({
    limit: fetchLimit,
    page: 1,
    sortBy: 'soldCount',
    sortOrder: 'DESC',
    sessionId,
    searchContext,
    skip: !shouldFetchFallback,
  });

  const fallbackVisibleProducts = getVisibleProducts(fallbackProducts, {
    excludeProductId: resolvedExcludeProductId,
  });

  const visibleProducts =
    primaryVisibleProducts.length > 0 ? primaryVisibleProducts : fallbackVisibleProducts;
  const isLoading = loading || (shouldFetchFallback && fallbackLoading);
  const resolvedError = error ?? (shouldFetchFallback ? fallbackError : undefined);

  if (isLoading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className={`md:px-0 px-4 ${SECTION_HEADING_CLASS}`}>{heading}</h2>
        <ProductSkeletonRow />
      </section>
    );
  }

  if (resolvedError || visibleProducts.length === 0) {
    return null;
  }

  const displayProducts = visibleProducts.slice(0, productLimit);

  const handleViewAllPrefetch = () => {
    if (viewAllHref.startsWith('/recommend')) {
      return;
    }

    prefetchProductsListing({
      page: 1,
      limit: 10,
      storeId: storeId ?? undefined,
      category: personalizedFilters?.category,
      tag: personalizedFilters?.tag,
      sortBy: referenceProduct ? 'soldCount' : undefined,
      sortOrder: referenceProduct ? 'DESC' : undefined,
    });
  };

  return (
    <section className="w-full">
      <h2 className={`md:px-0 px-4 ${SECTION_HEADING_CLASS}`}>{heading}</h2>
      {layout === 'grid' ? (
        <div className={PRODUCT_CARD_GRID_CLASS}>
          {displayProducts.map((product, index) => (
            <div key={product.id} className={cn(getGridProductVisibilityClass(index))}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className={PRODUCT_CAROUSEL_CLASS}>
          {displayProducts.map((product) => (
            <div key={product.id} className="shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center justify-center">
        <Link
          href={viewAllHref}
          onMouseEnter={handleViewAllPrefetch}
          onFocus={handleViewAllPrefetch}
        >
          <Button variant="secondary">
            <div className="flex items-center gap-2 px-4 py-2 md:py-0">
              <p className="text-center">ดูทั้งหมด</p>
              <RightArrowLineIcon size={{ mobile: 11, desktop: 11 }} color="#FF6F61" />
            </div>
          </Button>
        </Link>
      </div>
    </section>
  );
}
