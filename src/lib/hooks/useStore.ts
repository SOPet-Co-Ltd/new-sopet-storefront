'use client';

import { useQuery } from '@apollo/client/react';
import {
  StoreBySlugDocument,
  type StoreBySlugQuery,
} from '@/lib/graphql/generated/graphql';

export type StoreDetail = NonNullable<StoreBySlugQuery['storeBySlug']>;

export type UseStoreParams = {
  slug: string;
  skip?: boolean;
};

export type UseStoreResult = {
  store: StoreDetail | null;
  loading: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useStore({ slug, skip = false }: UseStoreParams): UseStoreResult {
  const { data, loading, error } = useQuery(StoreBySlugDocument, {
    variables: { slug },
    skip: skip || !slug,
  });

  return {
    store: data?.storeBySlug ?? null,
    loading: !skip && Boolean(slug) && loading,
    error: toHookError(error),
  };
}
