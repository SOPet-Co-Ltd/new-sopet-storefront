import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { SearchSortValue } from '@/components/molecules/SearchSortBar';
import {
  ProductsDocument,
  ApprovedBrandsDocument,
  ApprovedPetTypesDocument,
  type ProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import {
  buildApprovedBrandsVariables,
  buildApprovedPetTypesVariables,
  buildProductsListingVariables,
} from '@/lib/graphql/query-variables';
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';
import { parseSearchSort } from '@/lib/search/searchSort';
import { parseSearchFilters, toProductsFilterVariables } from '@/lib/search/searchFilters';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { SESSION_ID_COOKIE, parseSessionIdCookie } from '@/lib/session';
import { buildSearchMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

const SEARCH_PRODUCT_LIMIT = 40;

export async function generateMetadata(): Promise<Metadata> {
  return buildSearchMetadata();
}

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    petType?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, sort, petType, brand, minPrice, maxPrice } = params;
  const trimmedQ = q?.trim() ?? '';
  const { sortBy, sortOrder } = parseSearchSort(sort as SearchSortValue | null);
  const filters = parseSearchFilters({
    get: (key) => {
      if (key === 'petType') return petType ?? null;
      if (key === 'brand') return brand ?? null;
      if (key === 'minPrice') return minPrice ?? null;
      if (key === 'maxPrice') return maxPrice ?? null;
      return null;
    },
  });
  const cookieStore = await cookies();
  const sessionId = parseSessionIdCookie(cookieStore.get(SESSION_ID_COOKIE)?.value);
  const variables = buildProductsListingVariables({
    search: trimmedQ || undefined,
    sortBy,
    sortOrder,
    page: 1,
    limit: SEARCH_PRODUCT_LIMIT,
    sessionId: sessionId ?? undefined,
    ...toProductsFilterVariables(filters),
  });
  const petTypesVariables = buildApprovedPetTypesVariables();
  const brandsVariables = buildApprovedBrandsVariables();

  let initialProducts: ProductsQuery['products']['items'] | undefined;
  let canPreloadQueries = false;

  const preload = await runSsrPreloadQueries('search', async () => {
    const result = await getClient().query({
      query: ProductsDocument,
      variables,
    });
    return result.data?.products.items;
  });

  if (preload.ok) {
    initialProducts = preload.data;
    canPreloadQueries = true;
  }

  const searchPage = <SearchResultsPage initialProducts={initialProducts} />;

  if (!canPreloadQueries) {
    return searchPage;
  }

  return (
    <PreloadQuery query={ProductsDocument} variables={variables} errorPolicy="all">
      <PreloadQuery
        query={ApprovedPetTypesDocument}
        variables={petTypesVariables}
        errorPolicy="all"
      >
        <PreloadQuery query={ApprovedBrandsDocument} variables={brandsVariables} errorPolicy="all">
          {searchPage}
        </PreloadQuery>
      </PreloadQuery>
    </PreloadQuery>
  );
}
