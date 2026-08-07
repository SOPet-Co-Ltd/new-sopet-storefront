/**
 * Resolution order (required by product spec):
 * campaign compare-at → variant static compareAtPrice → product static compareAtPrice
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
  sellPrice: number;
  campaignItem?: ActiveSaleCampaignItem | null;
  variantCompareAt?: number | null;
  productCompareAt?: number | null;
};

/**
 * `compareAt = sellPrice / (1 - percent/100)`, rounded to 2 decimals.
 * Only computable when percent is below 100 and sellPrice is positive.
 */
export function computeCompareAtFromDiscountPercent(
  sellPrice: number,
  percent: number | null | undefined,
): number | null {
  if (percent == null || percent >= 100 || sellPrice <= 0) return null;

  const compareAt = sellPrice / (1 - percent / 100);
  return Math.round(compareAt * 100) / 100;
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

/**
 * Resolves the compare-at (strikethrough) price using the required fallback chain.
 * Within the campaign item itself, an explicit `compareAtPrice` takes precedence
 * over a `discountPercent`-derived value.
 */
export function resolveCompareAtPrice({
  sellPrice,
  campaignItem,
  variantCompareAt,
  productCompareAt,
}: ResolveCompareAtPriceParams): number | null {
  if (campaignItem) {
    if (campaignItem.compareAtPrice != null) {
      return campaignItem.compareAtPrice;
    }

    const fromPercent = computeCompareAtFromDiscountPercent(
      sellPrice,
      campaignItem.discountPercent,
    );
    if (fromPercent != null) {
      return fromPercent;
    }
  }

  if (variantCompareAt != null) return variantCompareAt;
  if (productCompareAt != null) return productCompareAt;

  return null;
}
