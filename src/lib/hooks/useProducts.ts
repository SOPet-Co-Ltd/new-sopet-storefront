'use client';

import { useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ProductsDocument,
  type ProductsQuery,
  type ProductsQueryVariables,
} from '@/lib/graphql/generated/graphql';

export type ProductListItem = ProductsQuery['products']['items'][number];

export type UseProductsParams = {
  category?: string | null;
  search?: string | null;
  storeId?: string | null;
  tag?: string | null;
  page?: number;
  limit?: number;
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
  page = 1,
  limit = 24,
  skip = false,
}: UseProductsParams = {}): UseProductsResult {
  const variables: ProductsQueryVariables = {
    category,
    search,
    storeId,
    tag,
    page,
    limit,
  };

  const { data, loading, error, fetchMore: apolloFetchMore, refetch } = useQuery(ProductsDocument, {
    variables,
    skip,
  });

  const pagination = data?.products.pagination;

  const fetchMore = useCallback(
    (nextPage?: number) => {
      const targetPage = nextPage ?? (pagination?.page ?? page) + 1;
      return apolloFetchMore({
        variables: { category, search, storeId, tag, page: targetPage, limit },
        updateQuery: (_previous, { fetchMoreResult }) => fetchMoreResult ?? _previous,
      });
    },
    [apolloFetchMore, category, search, storeId, tag, limit, pagination?.page, page],
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
