import type { StorePromotionSelection } from '@/lib/checkout/storePromotionUtils';

export type CheckoutShippingSelection = {
  shippingOptionId: string;
  shippingFee: number;
};

export type CheckoutTotalsInput = {
  subtotal: number;
  itemCount: number;
  storeIds: string[];
  shippingByStoreId: Record<string, CheckoutShippingSelection>;
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
  platformPromotionDiscount: number;
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

export function calculateCheckoutTotals({
  subtotal,
  itemCount,
  storeIds,
  shippingByStoreId,
  storePromotionsByStoreId,
  platformPromotionDiscount,
}: CheckoutTotalsInput): CheckoutTotals {
  const storeDiscountTotal = Object.values(storePromotionsByStoreId).reduce(
    (total, promotion) => total + (promotion?.discountAmount ?? 0),
    0,
  );

  const shippingFeeTotal = storeIds.reduce((total, storeId) => {
    return total + (shippingByStoreId[storeId]?.shippingFee ?? 0);
  }, 0);

  const isShippingComplete = storeIds.every(
    (storeId) => Boolean(shippingByStoreId[storeId]?.shippingOptionId),
  );

  const totalDiscount = storeDiscountTotal + platformPromotionDiscount;
  const finalPrice = Math.max(subtotal + shippingFeeTotal - totalDiscount, 0);

  return {
    subtotal,
    itemCount,
    storeDiscountTotal,
    platformPromotionDiscount,
    totalDiscount,
    shippingFeeTotal,
    finalPrice,
    savingsTotal: totalDiscount,
    isShippingComplete,
  };
}
