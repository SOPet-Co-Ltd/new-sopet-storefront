'use client';

import { useQuery } from '@apollo/client/react';
import {
  ActiveStorePromotionsDocument,
  type ActiveStorePromotionsQuery,
} from '@/lib/graphql/generated/graphql';

export type UseActiveStorePromotionsResult = {
  promotions: ActiveStorePromotionsQuery['activeStorePromotions'];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useActiveStorePromotions(
  storeId: string | null | undefined,
): UseActiveStorePromotionsResult {
  const { data, loading, error, refetch } = useQuery(ActiveStorePromotionsDocument, {
    variables: { storeId: storeId ?? '' },
    skip: !storeId,
  });

  return {
    promotions: data?.activeStorePromotions ?? [],
    loading: Boolean(storeId) && loading,
    error: toHookError(error),
    refetch: () => refetch(),
  };
}
