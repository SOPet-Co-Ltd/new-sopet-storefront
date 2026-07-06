'use client';

import { useQuery } from '@apollo/client/react';
import {
  ApprovedCategoriesDocument,
  type ApprovedCategoriesQuery,
} from '@/lib/graphql/generated/graphql';

export type Category = ApprovedCategoriesQuery['approvedCategories'][number];

export type UseCategoriesResult = {
  categories: Category[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useCategories(skip = false): UseCategoriesResult {
  const { data, loading, error, refetch } = useQuery(ApprovedCategoriesDocument, { skip });

  return {
    categories: data?.approvedCategories ?? [],
    loading: !skip && loading,
    error: toHookError(error),
    refetch: () => refetch(),
  };
}
