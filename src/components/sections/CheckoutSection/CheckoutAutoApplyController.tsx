'use client';

import { useApolloClient, useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { hasAutoApplyAttempted, markAutoApplyAttempted } from '@/lib/checkout/autoApplyOnceGate';
import { runCheckoutAutoApply } from '@/lib/checkout/runCheckoutAutoApply';
import { toPromotionEstimateCartLines } from '@/lib/checkout/storePromotionUtils';
import {
  ActivePlatformPromotionsDocument,
  ValidatePromotionDocument,
  type ValidatePromotionInput,
} from '@/lib/graphql/generated/graphql';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

/**
 * Invisible checkout orchestrator (UI Spec CheckoutAutoApplyController).
 * No toast / banner / spinner — FR-8 confirmation via existing applied surfaces only.
 */
export function CheckoutAutoApplyController() {
  const client = useApolloClient();
  const {
    loading: cartLoading,
    selectedItemCount,
    selectedItems,
    selectedItemsByStore,
    selectedSubtotal,
  } = useCart();
  const {
    promotionCode,
    storePromotionsByStoreId,
    setPromotion,
    setPromotionName,
    setPromotionDiscount,
    setPromotionFreeUnits,
    setPromotionProductId,
    setStorePromotion,
  } = useCheckout();

  // client.query (not useLazyQuery) — auto-apply validates platform + stores in parallel;
  // lazy-query result slots race and drop all but the last in-flight response.
  const validatePromotion = useCallback(
    async (input: ValidatePromotionInput) => {
      const result = await client.query({
        query: ValidatePromotionDocument,
        variables: { input },
        fetchPolicy: 'network-only',
      });
      return result.data?.validatePromotion;
    },
    [client],
  );

  // Use useQuery directly so readiness = data|error settled (not empty `?? []` while pending).
  const {
    data: platformData,
    loading: platformLoading,
    error: platformError,
  } = useQuery(ActivePlatformPromotionsDocument);

  const attemptStartedRef = useRef(false);

  const cartReady = !cartLoading && selectedItemCount > 0;
  const platformSettled =
    Boolean(platformError) || (platformData !== undefined && !platformLoading);
  const ready = cartReady && platformSettled;
  const platformPromotions = useMemo(
    () => platformData?.activePlatformPromotions ?? [],
    [platformData?.activePlatformPromotions],
  );

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (hasAutoApplyAttempted() || attemptStartedRef.current) {
      return;
    }

    attemptStartedRef.current = true;

    const storeIds = selectedItemsByStore.map((group) => group.storeId);
    const storeSubtotals = Object.fromEntries(
      selectedItemsByStore.map((group) => [group.storeId, group.subtotal]),
    );
    const storeLinesByStoreId = Object.fromEntries(
      selectedItemsByStore.map((group) => [
        group.storeId,
        toPromotionEstimateCartLines(group.items),
      ]),
    );

    void (async () => {
      try {
        await runCheckoutAutoApply({
          promotionCode,
          storePromotionsByStoreId,
          storeIds,
          platformSubtotal: selectedSubtotal,
          storeSubtotals,
          platformLines: toPromotionEstimateCartLines(selectedItems),
          storeLinesByStoreId,
          platformPromotions,
          validatePromotion,
          client,
          setPromotion,
          setPromotionName,
          setPromotionDiscount,
          setPromotionFreeUnits,
          setPromotionProductId,
          setStorePromotion,
        });
      } catch {
        // Soft-fail entire attempt — still settle once-gate below.
      } finally {
        markAutoApplyAttempted();
      }
    })();
  }, [
    ready,
    promotionCode,
    storePromotionsByStoreId,
    selectedItemsByStore,
    selectedItems,
    selectedSubtotal,
    platformPromotions,
    validatePromotion,
    client,
    setPromotion,
    setPromotionName,
    setPromotionDiscount,
    setPromotionFreeUnits,
    setPromotionProductId,
    setStorePromotion,
  ]);

  return null;
}
