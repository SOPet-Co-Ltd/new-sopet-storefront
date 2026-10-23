'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  mergeListTimeEligibility,
  type ListTimeBatchStatus,
  type MergedListTimeEligibility,
  type PromotionAvailabilityContext,
  type PromotionEligibilityBatchItem,
  type PromotionEstimateCartLine,
  type StorePromotion,
} from '@/lib/checkout/storePromotionUtils';
import {
  buildValidatePromotionsInput,
  useValidatePromotions,
  type ValidatePromotionsCatalogTarget,
} from '@/lib/hooks/useValidatePromotions';

export type UsePromotionListTimeEligibilityParams = {
  promotions: ValidatePromotionsCatalogTarget[];
  catalogPromotions: StorePromotion[];
  subtotal: number;
  shippingFee?: number;
  cartLines?: PromotionEstimateCartLine[];
  context?: PromotionAvailabilityContext;
  /** When false, batch stays idle (e.g. modal closed without section-level fetch). */
  enabled?: boolean;
  catalogLoading?: boolean;
  catalogError?: boolean;
};

export type UsePromotionListTimeEligibilityResult = {
  merged: MergedListTimeEligibility;
  batchStatus: ListTimeBatchStatus;
  batchItems: PromotionEligibilityBatchItem[] | null;
  /** Banner suggest count — 0 until list-time batch settles (matches modal lists). */
  availablePromotionCount: number;
};

export function getListTimeAvailablePromotionCount(
  merged: MergedListTimeEligibility,
  batchStatus: ListTimeBatchStatus,
): number {
  if (batchStatus === 'idle' || batchStatus === 'loading') {
    return 0;
  }
  return merged.available.length;
}

export function usePromotionListTimeEligibility({
  promotions,
  catalogPromotions,
  subtotal,
  shippingFee = 0,
  cartLines,
  context,
  enabled = true,
  catalogLoading = false,
  catalogError = false,
}: UsePromotionListTimeEligibilityParams): UsePromotionListTimeEligibilityResult {
  const { validatePromotions } = useValidatePromotions();
  const [batchStatus, setBatchStatus] = useState<ListTimeBatchStatus>('idle');
  const [batchItems, setBatchItems] = useState<PromotionEligibilityBatchItem[] | null>(null);

  const shouldRunBatch = enabled && !catalogLoading && !catalogError && promotions.length > 0;

  const resolvedBatchStatus: ListTimeBatchStatus = shouldRunBatch ? batchStatus : 'idle';
  const resolvedBatchItems = resolvedBatchStatus === 'success' ? batchItems : null;

  const merged = useMemo(
    () =>
      mergeListTimeEligibility(
        catalogPromotions,
        subtotal,
        context,
        resolvedBatchItems,
        resolvedBatchStatus,
      ),
    [catalogPromotions, context, resolvedBatchItems, resolvedBatchStatus, subtotal],
  );

  const availablePromotionCount = useMemo(
    () => getListTimeAvailablePromotionCount(merged, resolvedBatchStatus),
    [merged, resolvedBatchStatus],
  );

  useEffect(() => {
    if (!shouldRunBatch) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setBatchStatus('loading');
    });

    const input = buildValidatePromotionsInput({
      promotions,
      subtotal,
      storeId: null,
      shippingFee,
      lines: cartLines,
    });

    void validatePromotions(input).then((result) => {
      if (cancelled) return;
      if (result?.items) {
        setBatchItems(result.items);
        setBatchStatus('success');
      } else {
        setBatchItems(null);
        setBatchStatus('error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cartLines, promotions, shippingFee, shouldRunBatch, subtotal, validatePromotions]);

  return {
    merged,
    batchStatus: resolvedBatchStatus,
    batchItems: resolvedBatchItems,
    availablePromotionCount,
  };
}
