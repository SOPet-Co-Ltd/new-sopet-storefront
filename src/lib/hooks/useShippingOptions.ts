'use client';

import { useQuery } from '@apollo/client/react';
import {
  StoreShippingOptionsDocument,
  type StoreShippingOptionsQuery,
} from '@/lib/graphql/generated/graphql';

export type ShippingOption =
  StoreShippingOptionsQuery['storeShippingOptions'][number];

export type UseShippingOptionsResult = {
  options: ShippingOption[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useShippingOptions(
  storeId: string | null | undefined,
): UseShippingOptionsResult {
  const { data, loading, error, refetch } = useQuery(StoreShippingOptionsDocument, {
    variables: { storeId: storeId ?? '' },
    skip: !storeId,
  });

  return {
    options: data?.storeShippingOptions ?? [],
    loading: Boolean(storeId) && loading,
    error: toHookError(error),
    refetch: () => refetch(),
  };
}
