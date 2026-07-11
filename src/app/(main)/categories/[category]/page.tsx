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

  try {
    const categoriesResult = await getClient().query({
      query: ApprovedCategoriesDocument,
    });
    categoryFilter = resolveCategoryFilterName(
      categoriesResult.data?.approvedCategories ?? [],
      categorySlug,
    );
  } catch {
    // Degrade to slug-based filtering when taxonomy lookup fails.
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
