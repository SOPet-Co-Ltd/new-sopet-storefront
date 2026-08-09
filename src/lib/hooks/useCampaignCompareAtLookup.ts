'use client';

import { useCallback, useMemo } from 'react';
import {
  computeSaleUnitPrice,
  pickCampaignItem,
  resolveCompareAtPrice,
} from '@/lib/catalog/resolve-compare-at-price';
import { useActiveSaleCampaignItemsForProducts } from '@/lib/hooks/useActiveSaleCampaignItems';

export type CampaignPricing = {
  saleUnit: number;
  compareAt: number | null;
  discountPercent: number | null;
};

export type CampaignCompareAtLookup = {
  /** Campaign-resolved compare-at for a product/variant, or null if none applies. */
  getCampaignCompareAt: (
    productId: string,
    variantId: string | null | undefined,
    sellPrice: number,
  ) => number | null;
  getCampaignPricing: (
    productId: string,
    variantId: string | null | undefined,
    catalogPrice: number,
  ) => CampaignPricing | null;
  loading: boolean;
  error: Error | undefined;
};

/**
 * Batch-fetches active sale campaign items for a set of product ids (one query for
 * the whole grid/list) and exposes per-product/variant sale unit + honest compare-at.
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

  const getCampaignPricing = useCallback(
    (productId: string, variantId: string | null | undefined, catalogPrice: number) => {
      const productItems = itemsByProduct.get(productId);
      const campaignItem = pickCampaignItem(productItems, productId, variantId);
      if (!campaignItem) return null;

      const saleUnit = computeSaleUnitPrice(catalogPrice, campaignItem.discountPercent);
      const compareAt = resolveCompareAtPrice({ sellPrice: catalogPrice, campaignItem });
      return {
        saleUnit: saleUnit ?? catalogPrice,
        compareAt,
        discountPercent: campaignItem.discountPercent ?? null,
      };
    },
    [itemsByProduct],
  );

  const getCampaignCompareAt = useCallback(
    (productId: string, variantId: string | null | undefined, sellPrice: number) => {
      return getCampaignPricing(productId, variantId, sellPrice)?.compareAt ?? null;
    },
    [getCampaignPricing],
  );

  return { getCampaignCompareAt, getCampaignPricing, loading, error };
}
