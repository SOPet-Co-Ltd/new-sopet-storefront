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
import { useCheckoutCartSelection } from '@/lib/hooks/useCheckoutCartSelection';
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
  } = useCheckoutCartSelection();
  const {
    promotionCode,
    storePromotionsByStoreId,
    shippingByStoreId,
    setPromotion,
    setPromotionName,
    setPromotionDiscount,
    setPromotionType,
    setPromotionFreeUnits,
    setPromotionProductId,
    setStorePromotion,
    setStorePromotions,
  } = useCheckout();

  // client.query (not useLazyQuery) — auto-apply validates platform + stores in parallel;
  // lazy-query result slots race and drop all but the last in-flight response.
  const validatePromotion = useCallback(
    async (input: ValidatePromotionInput) => {
      const result = await client.query({
        query: ValidatePromotionDocument,
        variables: { input },
        fetchPolicy: 'no-cache',
        context: { queryDeduplication: false },
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
  const promotionCodeRef = useRef(promotionCode);
  const storePromotionsRef = useRef(storePromotionsByStoreId);
  const shippingByStoreIdRef = useRef(shippingByStoreId);

  // Keep C1 / shipping snapshots current without putting promotion or shipping
  // state in the auto-apply deps (sibling store writes / per-store shipping
  // defaults must not re-enter the orchestrator).
  useEffect(() => {
    promotionCodeRef.current = promotionCode;
    storePromotionsRef.current = storePromotionsByStoreId;
    shippingByStoreIdRef.current = shippingByStoreId;
  }, [promotionCode, storePromotionsByStoreId, shippingByStoreId]);

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

    // C1 snapshot from refs so applying a store code cannot re-enter this effect.
    const snapshotPromotionCode = cartChangedSincePrior ? null : promotionCodeRef.current;
    const snapshotStorePromotions = cartChangedSincePrior ? {} : storePromotionsRef.current;

    // New order / cart content change: clear lanes so C1 empty-lane can re-fill winners.
    // Same-fingerprint remount keeps selections and skips via hasAutoApplyAttempted above.

    if (cartChangedSincePrior) {
      setPromotion(null);
      setPromotionName(null);
      setPromotionDiscount(0);
      setPromotionType(null);
      setPromotionFreeUnits(null);
      setPromotionProductId(null);
      const storeIdsToClear = new Set([
        ...Object.keys(storePromotionsRef.current),
        ...selectedItemsByStore.map((group) => group.storeId),
      ]);
      if (storeIdsToClear.size > 0) {
        const clears: Record<string, null> = {};
        for (const storeId of storeIdsToClear) {
          clears[storeId] = null;
        }
        setStorePromotions(clears);
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
    const shippingSnapshot = shippingByStoreIdRef.current;
    const storeShippingFees = Object.fromEntries(
      storeIds.map((storeId) => [storeId, shippingSnapshot[storeId]?.shippingFee ?? 0]),
    );
    const platformShippingFee = Object.values(storeShippingFees).reduce((sum, fee) => sum + fee, 0);

    void (async () => {
      try {
        await runCheckoutAutoApply({
          promotionCode: snapshotPromotionCode,
          storePromotionsByStoreId: snapshotStorePromotions,
          storeIds,
          platformSubtotal: selectedSubtotal,
          storeSubtotals,
          platformShippingFee,
          storeShippingFees,
          platformLines: toPromotionEstimateCartLines(selectedItems),
          storeLinesByStoreId,
          platformPromotions,
          validatePromotion,
          client,
          setPromotion,
          setPromotionName,
          setPromotionDiscount,
          setPromotionType,
          setPromotionFreeUnits,
          setPromotionProductId,
          setStorePromotion,
          setStorePromotions,
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
    selectedItemsByStore,
    selectedItems,
    selectedSubtotal,
    platformPromotions,
    validatePromotion,
    client,
    setPromotion,
    setPromotionName,
    setPromotionDiscount,
    setPromotionType,
    setPromotionFreeUnits,
    setPromotionProductId,
    setStorePromotion,
    setStorePromotions,
  ]);

  return null;
}
