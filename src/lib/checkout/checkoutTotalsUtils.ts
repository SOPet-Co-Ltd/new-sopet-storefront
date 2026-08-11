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
  platformPromotionDiscount: number;
  totalDiscount: number;
  shippingFeeTotal: number;
  finalPrice: number;
  savingsTotal: number;
  isShippingComplete: boolean;
};

/**
 * Allocate shipping-family discounts against one shared shipping fee pool
 * (platform first, then stores) so dual FREE_SHIPPING cannot double-count.
 */
export function allocateCheckoutDiscounts(params: {
  shippingFeeTotal: number;
  platformPromotionDiscount: number;
  platformPromotionType?: string | null;
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
}): {
  platformPromotionDiscount: number;
  storeDiscountTotal: number;
  totalDiscount: number;
} {
  let remainingShipping = Math.max(0, params.shippingFeeTotal);

  let platformPromotionDiscount = Math.max(0, params.platformPromotionDiscount);
  if (isShippingPromotionType(params.platformPromotionType)) {
    platformPromotionDiscount = Math.min(platformPromotionDiscount, remainingShipping);
    remainingShipping -= platformPromotionDiscount;
  }

  let storeDiscountTotal = 0;
  for (const promotion of Object.values(params.storePromotionsByStoreId)) {
    if (!promotion) continue;
    const raw = Math.max(0, promotion.discountAmount ?? 0);
    if (isShippingPromotionType(promotion.type)) {
      const applied = Math.min(raw, remainingShipping);
      storeDiscountTotal += applied;
      remainingShipping -= applied;
    } else {
      storeDiscountTotal += raw;
    }
  }

  return {
    platformPromotionDiscount,
    storeDiscountTotal,
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
  const shippingFeeTotal = storeIds.reduce((total, storeId) => {
    return total + (shippingByStoreId[storeId]?.shippingFee ?? 0);
  }, 0);

  const isShippingComplete = storeIds.every((storeId) =>
    Boolean(shippingByStoreId[storeId]?.shippingOptionId),
  );

  const allocated = allocateCheckoutDiscounts({
    shippingFeeTotal,
    platformPromotionDiscount,
    platformPromotionType,
    storePromotionsByStoreId,
  });

  const finalPrice = Math.max(subtotal + shippingFeeTotal - allocated.totalDiscount, 0);

  return {
    subtotal,
    itemCount,
    storeDiscountTotal: allocated.storeDiscountTotal,
    platformPromotionDiscount: allocated.platformPromotionDiscount,
    totalDiscount: allocated.totalDiscount,
    shippingFeeTotal,
    finalPrice,
    savingsTotal: allocated.totalDiscount,
    isShippingComplete,
  };
}
