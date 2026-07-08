'use client';

import { useQuery } from '@apollo/client/react';
import {
  ActivePlatformPromotionsDocument,
  type ActivePlatformPromotionsQuery,
} from '@/lib/graphql/generated/graphql';

export type UseActivePlatformPromotionsResult = {
  promotions: ActivePlatformPromotionsQuery['activePlatformPromotions'];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useActivePlatformPromotions(
  enabled: boolean,
): UseActivePlatformPromotionsResult {
  const { data, loading, error, refetch } = useQuery(ActivePlatformPromotionsDocument, {
    skip: !enabled,
  });

  return {
    promotions: data?.activePlatformPromotions ?? [],
    loading: enabled && loading,
    error: toHookError(error),
    refetch: () => refetch(),
  };
}
