'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  computeCartItemCount,
  computeCartSubtotal,
  groupCartItemsByStore,
  type CartItem,
  type StoreCartGroup,
} from '@/lib/cart/cartUtils';
import {
  clearBuyNowCheckout,
  getBuyNowCheckout,
  getBuyNowStorageSnapshot,
  subscribeBuyNowCheckout,
  toBuyNowCartItem,
} from '@/lib/checkout/buyNowCheckout';
import { useCart } from '@/lib/providers/CartProvider';

export const BUY_NOW_CHECKOUT_MODE = 'buy-now';

export type CheckoutCartSelection = {
  selectedItems: CartItem[];
  selectedItemsByStore: StoreCartGroup[];
  selectedItemCount: number;
  selectedSubtotal: number;
  loading: boolean;
  error: Error | undefined;
  isBuyNow: boolean;
  clearBuyNow: () => void;
  refetch: () => Promise<unknown>;
  pruneDeselectedIds: (itemIds: string[]) => void;
};

/**
 * Checkout line selection: either an active buy-now payload (cart untouched)
 * or the normal cart selected lines.
 *
 * Buy-now only applies when `/checkout?mode=buy-now` so a leftover session
 * cannot override a later cart checkout.
 */
export function useCheckoutCartSelection(): CheckoutCartSelection {
  const cart = useCart();
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get('mode') === BUY_NOW_CHECKOUT_MODE;
  const buyNowSnapshot = useSyncExternalStore(
    subscribeBuyNowCheckout,
    getBuyNowStorageSnapshot,
    () => null,
  );

  const buyNowPayload = useMemo(() => {
    if (!isBuyNowMode) return null;
    return buyNowSnapshot ? getBuyNowCheckout() : null;
  }, [buyNowSnapshot, isBuyNowMode]);

  const buyNowItems = useMemo(
    () => (buyNowPayload ? [toBuyNowCartItem(buyNowPayload)] : null),
    [buyNowPayload],
  );

  const clearBuyNow = useCallback(() => {
    clearBuyNowCheckout();
  }, []);

  return useMemo(() => {
    if (buyNowItems) {
      return {
        selectedItems: buyNowItems,
        selectedItemsByStore: groupCartItemsByStore(buyNowItems),
        selectedItemCount: computeCartItemCount(buyNowItems),
        selectedSubtotal: computeCartSubtotal(buyNowItems),
        loading: false,
        error: undefined,
        isBuyNow: true,
        clearBuyNow,
        refetch: async () => undefined,
        pruneDeselectedIds: () => undefined,
      };
    }

    return {
      selectedItems: cart.selectedItems,
      selectedItemsByStore: cart.selectedItemsByStore,
      selectedItemCount: cart.selectedItemCount,
      selectedSubtotal: cart.selectedSubtotal,
      loading: cart.loading,
      error: cart.error,
      isBuyNow: false,
      clearBuyNow,
      refetch: cart.refetch,
      pruneDeselectedIds: cart.pruneDeselectedIds,
    };
  }, [
    buyNowItems,
    clearBuyNow,
    cart.selectedItems,
    cart.selectedItemsByStore,
    cart.selectedItemCount,
    cart.selectedSubtotal,
    cart.loading,
    cart.error,
    cart.refetch,
    cart.pruneDeselectedIds,
  ]);
}
