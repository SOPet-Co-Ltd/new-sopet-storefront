'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  ActiveSaleCampaignItemsDocument,
  ActiveSaleCampaignItemsForProductsDocument,
  type ActiveSaleCampaignItemFieldsFragment,
} from '@/lib/graphql/generated/graphql';

export type ActiveSaleCampaignItem = ActiveSaleCampaignItemFieldsFragment;

export type UseActiveSaleCampaignItemsResult = {
  items: ActiveSaleCampaignItem[];
  loading: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

/** Active campaign items for a single store (PDP: strikethrough by variant). */
export function useActiveSaleCampaignItems(
  storeId: string | null | undefined,
): UseActiveSaleCampaignItemsResult {
  const canQuery = Boolean(storeId);
  const { data, loading, error } = useQuery(ActiveSaleCampaignItemsDocument, {
    variables: { storeId: storeId ?? '' },
    skip: !canQuery,
  });

  return {
    items: data?.activeSaleCampaignItems ?? [],
    loading: canQuery && loading,
    error: toHookError(error),
  };
}

/** Active campaign items across the given products (catalog cards: batch fetch). */
export function useActiveSaleCampaignItemsForProducts(
  productIds: string[] | null | undefined,
): UseActiveSaleCampaignItemsResult {
  const uniqueProductIds = useMemo(
    () => [...new Set((productIds ?? []).filter(Boolean))],
    [productIds],
  );
  const canQuery = uniqueProductIds.length > 0;

  const { data, loading, error } = useQuery(ActiveSaleCampaignItemsForProductsDocument, {
    variables: { productIds: uniqueProductIds },
    skip: !canQuery,
  });

  return {
    items: data?.activeSaleCampaignItemsForProducts ?? [],
    loading: canQuery && loading,
    error: toHookError(error),
  };
}
