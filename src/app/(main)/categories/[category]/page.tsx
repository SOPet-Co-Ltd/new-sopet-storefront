import type { Metadata } from 'next';
import type { SearchSortValue } from '@/components/molecules/SearchSortBar';
import { ProductsDocument, type ProductsQuery } from '@/lib/graphql/generated/graphql';
import { getClient } from '@/lib/graphql/apollo-rsc';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';
import {
  decodeRouteParam,
  resolveCategoryBySlug,
  resolveCategoryFilterName,
} from '@/lib/routing/categoryRoutes';
import { parseListingPageParam } from '@/lib/search/parseListingPageParam';
import { parseSearchFilters, toProductsFilterVariables } from '@/lib/search/searchFilters';
import { parseSearchSort } from '@/lib/search/searchSort';
import { CategoryPLP } from '@/components/sections/ProductListing';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchApprovedCategories } from '@/lib/seo/fetch';
import { getCategoryIndexation } from '@/lib/seo/indexability';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from '@/lib/seo/json-ld';
import { buildAbsoluteUrl, buildCategoryMetadata, buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    petType?: string;
    brand?: string;
    tag?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = decodeRouteParam(rawCategory);
  const indexation = getCategoryIndexation(categorySlug, resolvedSearchParams);
  const categories = await fetchApprovedCategories();

  if (!categories) {
    return buildPageMetadata({
      title: 'หมวดหมู่สินค้า',
      description: DEFAULT_SITE_DESCRIPTION,
      path: indexation.canonicalPath,
      robots: { index: false, follow: true },
    });
  }

  const category = resolveCategoryBySlug(categories, categorySlug);
  const categoryName = category?.name ?? resolveCategoryFilterName(categories, categorySlug);
  return buildCategoryMetadata(
    categoryName,
    categorySlug,
    indexation.indexable,
    category?.imageUrl,
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: rawCategory } = await params;
  const resolvedSearchParams = await searchParams;
  const { page: pageParam, sort, petType, brand, tag, minPrice, maxPrice } = resolvedSearchParams;
  const categorySlug = decodeRouteParam(rawCategory);
  const currentPage = parseListingPageParam(pageParam);
  const { sortBy, sortOrder } = parseSearchSort(sort as SearchSortValue | null);
  const filters = parseSearchFilters({
    get: (key) => {
      if (key === 'petType') return petType ?? null;
      if (key === 'brand') return brand ?? null;
      if (key === 'tag') return tag ?? null;
      if (key === 'minPrice') return minPrice ?? null;
      if (key === 'maxPrice') return maxPrice ?? null;
      return null;
    },
  });

  let categoryFilter = categorySlug;
  const categories = await fetchApprovedCategories();

  if (categories) {
    categoryFilter = resolveCategoryFilterName(categories, categorySlug);
  }

  const variables = buildProductsListingVariables({
    category: categoryFilter,
    page: currentPage,
    sortBy,
    sortOrder,
    ...toProductsFilterVariables(filters),
  });

  let initialProducts: ProductsQuery['products']['items'] | undefined;
  let initialTotal: number | undefined;
  let initialTotalPages: number | undefined;

  const preload = await runSsrPreloadQueries('category', async () => {
    const result = await getClient().query({
      query: ProductsDocument,
      variables,
    });
    return result.data?.products;
  });

  if (preload.ok && preload.data) {
    initialProducts = preload.data.items;
    initialTotal = preload.data.pagination.total;
    initialTotalPages = preload.data.pagination.totalPages;
  }

  const indexation = getCategoryIndexation(categorySlug, resolvedSearchParams);
  const categoryName = resolveCategoryFilterName(categories ?? [], categorySlug);
  const pageUrl = buildAbsoluteUrl(indexation.canonicalPath);
  const structuredData =
    indexation.indexable && categories
      ? [
          buildCollectionPageJsonLd({
            name: categoryName,
            description: `เลือกซื้อ${categoryName}จากร้านค้าที่ได้รับการอนุมัติบน Sopet`,
            url: pageUrl,
          }),
          buildBreadcrumbJsonLd([
            { name: 'หน้าแรก', url: buildAbsoluteUrl('/') },
            { name: categoryName, url: pageUrl },
          ]),
        ]
      : null;

  return (
    <>
      {structuredData ? <JsonLdScript data={structuredData} /> : null}
      <main className="w-full px-4 py-4 lg:px-20">
        <CategoryPLP
          categorySlug={categorySlug}
          categoryFilter={categoryFilter}
          categoryName={categoryName}
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          initialTotalPages={initialTotalPages}
          initialPage={currentPage}
        />
      </main>
    </>
  );
}
