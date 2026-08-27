import {
  isShippingPromotionType,
  type StorePromotionSelection,
} from '@/lib/checkout/storePromotionUtils';

export type CheckoutShippingSelection = {
  shippingOptionId: string;
  shippingFee?: number;
};

export type CheckoutTotalsInput = {
  subtotal: number;
  itemCount: number;
  storeIds: string[];
  shippingByStoreId: Record<string, CheckoutShippingSelection>;
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
  platformPromotionDiscount: number;
  /** Platform promo type — needed to stack shipping vs merchandise discounts. */
  platformPromotionType?: string | null;
};

export type CheckoutTotals = {
  subtotal: number;
  itemCount: number;
  storeDiscountTotal: number;
  /** Per-store allocated discount (capped for shipping promos). */
  storeDiscountByStoreId: Record<string, number>;
  platformPromotionDiscount: number;
  totalDiscount: number;
  shippingFeeTotal: number;
  finalPrice: number;
  savingsTotal: number;
  isShippingComplete: boolean;
};

/**
 * Resolve a store promo's discount against that store's current shipping fee.
 * Shipping promos are capped to the store fee; free_shipping uses the live fee.
 */
export function resolveStorePromoDiscount(
  promotion: StorePromotionSelection,
  storeFee: number,
): number {
  if (!promotion) return 0;

  const cappedStoreFee = Math.max(0, storeFee);
  const raw = Math.max(0, promotion.discountAmount ?? 0);

  if (isShippingPromotionType(promotion.type)) {
    if (promotion.type === 'free_shipping') {
      return cappedStoreFee;
    }
    return Math.min(raw, cappedStoreFee);
  }

  return raw;
}

/**
 * Allocate shipping-family discounts: platform first against the shared pool,
 * then each store's shipping promo capped to that store's fee (and remaining pool).
 */
export function allocateCheckoutDiscounts(params: {
  shippingFeeTotal: number;
  shippingFeeByStoreId: Record<string, number>;
  platformPromotionDiscount: number;
  platformPromotionType?: string | null;
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
}): {
  platformPromotionDiscount: number;
  storeDiscountTotal: number;
  storeDiscountByStoreId: Record<string, number>;
  totalDiscount: number;
} {
  let remainingShipping = Math.max(0, params.shippingFeeTotal);

  let platformPromotionDiscount = Math.max(0, params.platformPromotionDiscount);
  if (isShippingPromotionType(params.platformPromotionType)) {
    platformPromotionDiscount = Math.min(platformPromotionDiscount, remainingShipping);
    remainingShipping -= platformPromotionDiscount;
  }

  let storeDiscountTotal = 0;
  const storeDiscountByStoreId: Record<string, number> = {};

  for (const [storeId, promotion] of Object.entries(params.storePromotionsByStoreId)) {
    if (!promotion) continue;

    const storeFee = Math.max(0, params.shippingFeeByStoreId[storeId] ?? 0);

    if (isShippingPromotionType(promotion.type)) {
      const storeScoped = resolveStorePromoDiscount(promotion, storeFee);
      const applied = Math.min(storeScoped, remainingShipping);
      storeDiscountByStoreId[storeId] = applied;
      storeDiscountTotal += applied;
      remainingShipping -= applied;
    } else {
      const raw = Math.max(0, promotion.discountAmount ?? 0);
      storeDiscountByStoreId[storeId] = raw;
      storeDiscountTotal += raw;
    }
  }

  return {
    platformPromotionDiscount,
    storeDiscountTotal,
    storeDiscountByStoreId,
    totalDiscount: storeDiscountTotal + platformPromotionDiscount,
  };
}

export function calculateCheckoutTotals({
  subtotal,
  itemCount,
  storeIds,
  shippingByStoreId,
  storePromotionsByStoreId,
  platformPromotionDiscount,
  platformPromotionType,
}: CheckoutTotalsInput): CheckoutTotals {
  const shippingFeeByStoreId: Record<string, number> = {};
  const shippingFeeTotal = storeIds.reduce((total, storeId) => {
    const fee = shippingByStoreId[storeId]?.shippingFee ?? 0;
    shippingFeeByStoreId[storeId] = fee;
    return total + fee;
  }, 0);

  const isShippingComplete = storeIds.every((storeId) =>
    Boolean(shippingByStoreId[storeId]?.shippingOptionId),
  );

  const allocated = allocateCheckoutDiscounts({
    shippingFeeTotal,
    shippingFeeByStoreId,
    platformPromotionDiscount,
    platformPromotionType,
    storePromotionsByStoreId,
  });

  const finalPrice = Math.max(subtotal + shippingFeeTotal - allocated.totalDiscount, 0);

  return {
    subtotal,
    itemCount,
    storeDiscountTotal: allocated.storeDiscountTotal,
    storeDiscountByStoreId: allocated.storeDiscountByStoreId,
    platformPromotionDiscount: allocated.platformPromotionDiscount,
    totalDiscount: allocated.totalDiscount,
    shippingFeeTotal,
    finalPrice,
    savingsTotal: allocated.totalDiscount,
    isShippingComplete,
  };
}
