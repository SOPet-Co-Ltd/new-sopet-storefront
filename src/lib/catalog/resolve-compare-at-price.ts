/**
 * Sale unit + honest compare-at (was) for active sale campaigns.
 * Never invent compare-at from percent (no catalog / (1 − %/100)).
 */

export type ActiveSaleCampaignItem = {
  campaignId: string;
  campaignName?: string | null;
  productId: string;
  variantId?: string | null;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  priority: number;
  expiresAt?: string | null;
};

export type ResolveCompareAtPriceParams = {
  /** Catalog sell price (basePrice + adjustment), not the sale unit. */
  sellPrice: number;
  campaignItem?: ActiveSaleCampaignItem | null;
  variantCompareAt?: number | null;
  productCompareAt?: number | null;
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Payable sale unit: catalog × (1 − %/100), 2 dp.
 * Null when percent is missing or not in 1–99, or catalog is not positive.
 */
export function computeSaleUnitPrice(
  catalogUnit: number,
  percent: number | null | undefined,
): number | null {
  if (percent == null || percent < 1 || percent > 99 || catalogUnit <= 0) return null;
  return roundMoney(catalogUnit * (1 - percent / 100));
}

/**
 * Picks the best-matching campaign item for a product/variant pair:
 * 1. Prefer an item with matching productId + variantId.
 * 2. Else an item with matching productId and a null variantId (applies to all variants).
 * 3. Among matches, the highest priority wins — items are assumed already ordered
 *    DESC by priority by the backend, so the first match in each tier is used.
 */
export function pickCampaignItem<T extends ActiveSaleCampaignItem>(
  items: T[] | null | undefined,
  productId: string,
  variantId?: string | null,
): T | null {
  if (!items || items.length === 0) return null;

  const productItems = items.filter((item) => item.productId === productId);
  if (productItems.length === 0) return null;

  if (variantId) {
    const variantMatch = productItems.find((item) => item.variantId === variantId);
    if (variantMatch) return variantMatch;
  }

  const allVariantsMatch = productItems.find((item) => item.variantId == null);
  return allVariantsMatch ?? null;
}

function honestCampaignWas(
  catalogUnit: number,
  campaignItem: ActiveSaleCampaignItem,
): number | null {
  const explicit = campaignItem.compareAtPrice;
  if (explicit != null && explicit > catalogUnit) return explicit;

  const saleUnit = computeSaleUnitPrice(catalogUnit, campaignItem.discountPercent);
  if (saleUnit != null) return catalogUnit;

  return null;
}

/**
 * Resolves the compare-at (strikethrough) price.
 * Campaign: explicit compare-at if > catalog, else catalog when a real % sale applies.
 * Else static variant → product compare-at. Never invents was from %.
 */
export function resolveCompareAtPrice({
  sellPrice,
  campaignItem,
  variantCompareAt,
  productCompareAt,
}: ResolveCompareAtPriceParams): number | null {
  if (campaignItem) {
    const fromCampaign = honestCampaignWas(sellPrice, campaignItem);
    if (fromCampaign != null) return fromCampaign;
  }

  if (variantCompareAt != null) return variantCompareAt;
  if (productCompareAt != null) return productCompareAt;

  return null;
}
