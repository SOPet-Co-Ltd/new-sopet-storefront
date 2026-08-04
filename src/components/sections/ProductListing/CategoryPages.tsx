'use client';

import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { useCategories } from '@/lib/hooks/useCategories';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import {
  buildCategoryHref,
  resolveCategoryBySlug,
  resolveCategoryFilterName,
} from '@/lib/routing/categoryRoutes';
import { SearchResultsLayout } from '@/components/sections/SearchResultsLayout';
import { ProductListing } from './ProductListing';
import { ProductListingSkeleton } from './ProductListingSkeleton';

type CategoryPLPProps = {
  categorySlug: string;
  categoryFilter?: string;
  initialProducts?: ProductsQuery['products']['items'];
  initialPage?: number;
};

function CategoryBreadcrumbs({ categorySlug }: { categorySlug: string }) {
  const { categories, loading } = useCategories();
  const category = resolveCategoryBySlug(categories, categorySlug);
  const currentLabel = loading ? categorySlug : (category?.name ?? categorySlug);

  return (
    <Breadcrumbs
      className="mb-2"
      items={[
        { label: 'หน้าแรก', path: '/' },
        { label: currentLabel, path: buildCategoryHref(categorySlug) },
      ]}
    />
  );
}

function CategoryHeader({ categorySlug }: { categorySlug: string }) {
  const { categories, loading } = useCategories();
  const category = resolveCategoryBySlug(categories, categorySlug);
  const title = loading ? categorySlug : (category?.name ?? categorySlug);

  return (
    <div className="mb-4">
      <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 uppercase">{title}</h1>
    </div>
  );
}

export function CategoryPLP({
  categorySlug,
  categoryFilter: initialCategoryFilter,
  initialProducts,
  initialPage,
}: CategoryPLPProps) {
  const { categories, loading } = useCategories();
  const resolvedCategory = !loading ? resolveCategoryBySlug(categories, categorySlug) : undefined;
  const categoryUnresolvable = !loading && !resolvedCategory;
  const awaitingCategoryResolution = loading && !initialCategoryFilter;
  const categoryFilter =
    loading && initialCategoryFilter
      ? initialCategoryFilter
      : resolveCategoryFilterName(categories, categorySlug);

  return (
    <>
      <CategoryBreadcrumbs categorySlug={categorySlug} />
      <CategoryHeader categorySlug={categorySlug} />
      <SearchResultsLayout>
        {categoryUnresolvable ? (
          <EmptySearchResults message="ไม่พบสินค้าในหมวดหมู่นี้" />
        ) : awaitingCategoryResolution ? (
          <ProductListingSkeleton />
        ) : (
          <Suspense fallback={<ProductListingSkeleton />}>
            <ProductListing
              category={categoryFilter}
              initialProducts={initialProducts}
              initialPage={initialPage}
            />
          </Suspense>
        )}
      </SearchResultsLayout>
    </>
  );
}
