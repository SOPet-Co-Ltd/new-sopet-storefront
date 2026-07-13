import type { Metadata } from 'next';
import {
  ApprovedCategoriesDocument,
  ProductsDocument,
  type ProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';
import { decodeRouteParam, resolveCategoryFilterName } from '@/lib/routing/categoryRoutes';
import { parseSearchFilters, toProductsFilterVariables } from '@/lib/search/searchFilters';
import { CategoryPLP } from '@/components/sections/ProductListing';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchApprovedCategories } from '@/lib/seo/fetch';
import { getCategoryIndexation } from '@/lib/seo/indexability';
import { buildCategoryMetadata, buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
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

  const categoryName = resolveCategoryFilterName(categories, categorySlug);
  return buildCategoryMetadata(categoryName, categorySlug, indexation.indexable);
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: rawCategory } = await params;
  const resolvedSearchParams = await searchParams;
  const { page: pageParam, petType, brand, tag, minPrice, maxPrice } = resolvedSearchParams;
  const categorySlug = decodeRouteParam(rawCategory);
  const currentPage = Math.max(1, Number(pageParam ?? 1));
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
    ...toProductsFilterVariables(filters),
  });

  let initialProducts: ProductsQuery['products']['items'] | undefined;

  try {
    const result = await getClient().query({
      query: ProductsDocument,
      variables,
    });
    initialProducts = result.data?.products.items;
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  return (
    <PreloadQuery query={ApprovedCategoriesDocument} variables={{}}>
      <PreloadQuery query={ProductsDocument} variables={variables}>
        <main className="w-full px-4 py-4 lg:px-20">
          <CategoryPLP
            categorySlug={categorySlug}
            categoryFilter={categoryFilter}
            initialProducts={initialProducts}
            initialPage={currentPage}
          />
        </main>
      </PreloadQuery>
    </PreloadQuery>
  );
}
