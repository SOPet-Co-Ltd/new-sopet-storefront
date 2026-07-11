import { ProductsDocument, type ProductsQueryVariables } from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';

export type ProductsListingPrefetchParams = Pick<
  ProductsQueryVariables,
  | 'category'
  | 'search'
  | 'storeId'
  | 'tag'
  | 'petTypeIds'
  | 'brandIds'
  | 'minPrice'
  | 'maxPrice'
  | 'page'
  | 'limit'
  | 'sortBy'
  | 'sortOrder'
  | 'sessionId'
  | 'searchContext'
>;

const prefetchedListingKeys = new Set<string>();
const inflightListingPrefetches = new Map<string, Promise<unknown>>();

export function buildProductsListingCacheKey(variables: ProductsListingPrefetchParams): string {
  return JSON.stringify({
    category: variables.category ?? null,
    search: variables.search ?? null,
    storeId: variables.storeId ?? null,
    tag: variables.tag ?? null,
    petTypeIds: variables.petTypeIds ?? null,
    brandIds: variables.brandIds ?? null,
    minPrice: variables.minPrice ?? null,
    maxPrice: variables.maxPrice ?? null,
    page: variables.page ?? 1,
    limit: variables.limit ?? 24,
    sortBy: variables.sortBy ?? null,
    sortOrder: variables.sortOrder ?? null,
    sessionId: variables.sessionId ?? null,
    searchContext: variables.searchContext ?? null,
  });
}

export function createListingPrefetchHandlers(params: ProductsListingPrefetchParams): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  const prefetch = () => prefetchProductsListing(params);

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

export function prefetchProductsListing(params: ProductsListingPrefetchParams): void {
  const variables: ProductsListingPrefetchParams = {
    page: 1,
    ...params,
  };

  const cacheKey = buildProductsListingCacheKey(variables);
  if (prefetchedListingKeys.has(cacheKey) || inflightListingPrefetches.has(cacheKey)) {
    return;
  }

  const promise = getApolloClient()
    .query({
      query: ProductsDocument,
      variables,
      fetchPolicy: 'cache-first',
    })
    .then(() => {
      prefetchedListingKeys.add(cacheKey);
    })
    .finally(() => {
      inflightListingPrefetches.delete(cacheKey);
    });

  inflightListingPrefetches.set(cacheKey, promise);
}
