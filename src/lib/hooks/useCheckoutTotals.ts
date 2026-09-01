'use client';

import { useMemo } from 'react';
import { calculateCheckoutTotals } from '@/lib/checkout/checkoutTotalsUtils';
import { useCheckoutCartSelection } from '@/lib/hooks/useCheckoutCartSelection';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export function useCheckoutTotals() {
  const { selectedItemCount, selectedSubtotal, selectedItemsByStore } = useCheckoutCartSelection();
  const { shippingByStoreId, promotionDiscount, promotionType, storePromotionsByStoreId } =
    useCheckout();

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
        platformPromotionType: promotionType,
      }),
    [
      selectedSubtotal,
      selectedItemCount,
      storeIds,
      shippingByStoreId,
      storePromotionsByStoreId,
      promotionDiscount,
      promotionType,
    ],
  );
}
