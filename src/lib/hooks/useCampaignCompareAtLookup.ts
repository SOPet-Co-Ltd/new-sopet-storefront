'use client';

import { useCallback, useMemo } from 'react';
import { pickCampaignItem, resolveCompareAtPrice } from '@/lib/catalog/resolve-compare-at-price';
import { useActiveSaleCampaignItemsForProducts } from '@/lib/hooks/useActiveSaleCampaignItems';

export type CampaignCompareAtLookup = {
  /** Campaign-resolved compare-at for a product/variant, or null if none applies. */
  getCampaignCompareAt: (
    productId: string,
    variantId: string | null | undefined,
    sellPrice: number,
  ) => number | null;
  loading: boolean;
  error: Error | undefined;
};

/**
 * Batch-fetches active sale campaign items for a set of product ids (one query for
 * the whole grid/list) and exposes a per-product/variant lookup for compare-at price.
 */
export function useCampaignCompareAtLookup(
  productIds: string[] | null | undefined,
): CampaignCompareAtLookup {
  const { items, loading, error } = useActiveSaleCampaignItemsForProducts(productIds);

  const itemsByProduct = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.productId, [item]);
      }
    }
    return map;
  }, [items]);

  const getCampaignCompareAt = useCallback(
    (productId: string, variantId: string | null | undefined, sellPrice: number) => {
      const productItems = itemsByProduct.get(productId);
      const campaignItem = pickCampaignItem(productItems, productId, variantId);
      return resolveCompareAtPrice({ sellPrice, campaignItem });
    },
    [itemsByProduct],
  );

  return { getCampaignCompareAt, loading, error };
}
