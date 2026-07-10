'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ProductsDocument,
  type ProductsQuery,
  type ProductsQueryVariables,
  type SearchContextInput,
} from '@/lib/graphql/generated/graphql';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';

export type ProductListItem = ProductsQuery['products']['items'][number];

export type UseProductsParams = {
  category?: string | null;
  search?: string | null;
  storeId?: string | null;
  tag?: string | null;
  petTypeIds?: string[] | null;
  brandIds?: string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  limit?: number;
  sortBy?: string | null;
  sortOrder?: 'ASC' | 'DESC' | null;
  sessionId?: string | null;
  searchContext?: SearchContextInput | null;
  skip?: boolean;
};

export type UseProductsResult = {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: Error | undefined;
  fetchMore: (nextPage?: number) => Promise<unknown>;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useProducts({
  category,
  search,
  storeId,
  tag,
  petTypeIds,
  brandIds,
  minPrice,
  maxPrice,
  page = 1,
  limit = 24,
  sortBy,
  sortOrder,
  sessionId,
  searchContext,
  skip = false,
}: UseProductsParams = {}): UseProductsResult {
  const variables: ProductsQueryVariables = useMemo(
    () =>
      buildProductsListingVariables({
        category,
        search,
        storeId,
        tag,
        petTypeIds,
        brandIds,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
        sessionId,
        searchContext,
      }),
    [
      category,
      search,
      storeId,
      tag,
      petTypeIds,
      brandIds,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
      sessionId,
      searchContext,
    ],
  );

  const { data, loading, error, fetchMore: apolloFetchMore, refetch } = useQuery(ProductsDocument, {
    variables,
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const pagination = data?.products.pagination;

  const fetchMore = useCallback(
    (nextPage?: number) => {
      const targetPage = nextPage ?? (pagination?.page ?? page) + 1;
      return apolloFetchMore({
        variables: { ...variables, page: targetPage },
        updateQuery: (_previous, { fetchMoreResult }) => fetchMoreResult ?? _previous,
      });
    },
    [apolloFetchMore, variables, pagination?.page, page],
  );

  return {
    products: data?.products.items ?? [],
    total: pagination?.total ?? 0,
    page: pagination?.page ?? page,
    limit: pagination?.limit ?? limit,
    totalPages: pagination?.totalPages ?? 0,
    loading: !skip && loading,
    error: toHookError(error),
    fetchMore,
    refetch: () => refetch(),
  };
}
