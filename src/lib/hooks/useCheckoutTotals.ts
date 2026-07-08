'use client';

import { useMemo } from 'react';
import { calculateCheckoutTotals } from '@/lib/checkout/checkoutTotalsUtils';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export function useCheckoutTotals() {
  const { selectedItemCount, selectedSubtotal, selectedItemsByStore } = useCart();
  const { shippingByStoreId, promotionDiscount, storePromotionsByStoreId } = useCheckout();

  const storeIds = useMemo(
    () => selectedItemsByStore.map((group) => group.storeId),
    [selectedItemsByStore],
  );

  return useMemo(
    () =>
      calculateCheckoutTotals({
        subtotal: selectedSubtotal,
        itemCount: selectedItemCount,
        storeIds,
        shippingByStoreId,
        storePromotionsByStoreId,
        platformPromotionDiscount: promotionDiscount,
      }),
    [
      selectedSubtotal,
      selectedItemCount,
      storeIds,
      shippingByStoreId,
      storePromotionsByStoreId,
      promotionDiscount,
    ],
  );
}
