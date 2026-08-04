'use client';

import { useApolloClient, useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  buildAutoApplyCartFingerprint,
  getAutoApplyAttemptedFingerprint,
  hasAutoApplyAttempted,
  markAutoApplyAttempted,
} from '@/lib/checkout/autoApplyOnceGate';
import { runCheckoutAutoApply } from '@/lib/checkout/runCheckoutAutoApply';
import { toPromotionEstimateCartLines } from '@/lib/checkout/storePromotionUtils';
import {
  ActivePlatformPromotionsDocument,
  ValidatePromotionDocument,
  type ValidatePromotionInput,
} from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

/**
 * Invisible checkout orchestrator (UI Spec CheckoutAutoApplyController).
 * No toast / banner / spinner — FR-8 confirmation via existing applied surfaces only.
 *
 * Once-gate is scoped to selected-cart fingerprint: remount/refresh with the same
 * cart does not re-run; a new order or cart content change does.
 */
export function CheckoutAutoApplyController() {
  const client = useApolloClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  const prevAuthenticatedRef = useRef(isAuthenticated);
  const prevFingerprintRef = useRef<string | null>(null);

  const cartFingerprint = useMemo(
    () =>
      buildAutoApplyCartFingerprint(
        selectedItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      ),
    [selectedItems],
  );

  // Cart/order content changed → allow a fresh attempt for the new fingerprint.
  useEffect(() => {
    if (prevFingerprintRef.current !== cartFingerprint) {
      prevFingerprintRef.current = cartFingerprint;
      attemptStartedRef.current = false;
    }
  }, [cartFingerprint]);

  // Login clears the once-gate; allow a fresh in-mount attempt for loggedInOnly winners.
  useEffect(() => {
    if (prevAuthenticatedRef.current !== isAuthenticated) {
      prevAuthenticatedRef.current = isAuthenticated;
      if (isAuthenticated && getAutoApplyAttemptedFingerprint() == null) {
        attemptStartedRef.current = false;
      }
    }
  }, [isAuthenticated]);

  const cartReady = !cartLoading && selectedItemCount > 0;
  const platformSettled =
    Boolean(platformError) || (platformData !== undefined && !platformLoading);
  // Wait for auth hydration so members-only validates see the bearer token (or confirmed guest).
  const ready = cartReady && platformSettled && !authLoading;
  const platformPromotions = useMemo(
    () => platformData?.activePlatformPromotions ?? [],
    [platformData?.activePlatformPromotions],
  );

  useEffect(() => {
    if (!ready || !cartFingerprint) {
      return;
    }

    if (hasAutoApplyAttempted(cartFingerprint) || attemptStartedRef.current) {
      return;
    }

    attemptStartedRef.current = true;

    const priorFingerprint = getAutoApplyAttemptedFingerprint();
    const cartChangedSincePrior = priorFingerprint != null && priorFingerprint !== cartFingerprint;

    // New order / cart content change: clear lanes so C1 empty-lane can re-fill winners.
    // Same-fingerprint remount keeps selections and skips via hasAutoApplyAttempted above.
    if (cartChangedSincePrior) {
      setPromotion(null);
      setPromotionName(null);
      setPromotionDiscount(0);
      setPromotionFreeUnits(null);
      setPromotionProductId(null);
      const storeIdsToClear = new Set([
        ...Object.keys(storePromotionsByStoreId),
        ...selectedItemsByStore.map((group) => group.storeId),
      ]);
      for (const storeId of storeIdsToClear) {
        setStorePromotion(storeId, null);
      }
    }

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

    // Pass empty lane snapshot when cart changed — React state setters are async.
    const snapshotPromotionCode = cartChangedSincePrior ? null : promotionCode;
    const snapshotStorePromotions = cartChangedSincePrior ? {} : storePromotionsByStoreId;

    void (async () => {
      try {
        await runCheckoutAutoApply({
          promotionCode: snapshotPromotionCode,
          storePromotionsByStoreId: snapshotStorePromotions,
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
        markAutoApplyAttempted(cartFingerprint);
      }
    })();
  }, [
    ready,
    cartFingerprint,
    isAuthenticated,
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
