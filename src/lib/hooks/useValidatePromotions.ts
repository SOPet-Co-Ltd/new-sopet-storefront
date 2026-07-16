'use client';

import { useCallback } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import {
  ValidatePromotionsDocument,
  type ValidatePromotionLineInput,
  type ValidatePromotionsInput,
  type ValidatePromotionsQuery,
  type ValidatePromotionsTargetInput,
} from '@/lib/graphql/generated/graphql';
import { toValidatePromotionLines } from '@/lib/checkout/validateCheckoutPromotion';
import type { PromotionEstimateCartLine } from '@/lib/checkout/storePromotionUtils';

/** ADR Decision 6 / Backend DD — max targets per validatePromotions batch. */
export const MAX_VALIDATE_PROMOTIONS_TARGETS = 20;

export type PromotionEligibilityItem =
  ValidatePromotionsQuery['validatePromotions']['items'][number];

export type ValidatePromotionsCatalogTarget = {
  id?: string | null;
  code?: string | null;
};

export type BuildValidatePromotionsInputParams = {
  /** Catalog rows from active* lists — prefer both id and code; capped at ≤20. */
  promotions: ValidatePromotionsCatalogTarget[];
  subtotal: number;
  /** Store modal: required store UUID. Platform modal: omit/null. */
  storeId?: string | null;
  lines?: PromotionEstimateCartLine[] | ValidatePromotionLineInput[];
};

/**
 * Builds a single ValidatePromotionsInput for list-time batch (AC-046).
 * Callers must fire one validatePromotions — never N× validatePromotion on picker open.
 */
export function buildValidatePromotionsInput(
  params: BuildValidatePromotionsInputParams,
): ValidatePromotionsInput {
  const promotions: ValidatePromotionsTargetInput[] = [];

  for (const row of params.promotions) {
    if (promotions.length >= MAX_VALIDATE_PROMOTIONS_TARGETS) break;

    const id = row.id?.trim() || undefined;
    const code = row.code?.trim() || undefined;
    if (!id && !code) continue;

    promotions.push({
      ...(id ? { id } : {}),
      ...(code ? { code } : {}),
    });
  }

  const mappedLines = toValidatePromotionLines(params.lines, params.storeId);

  return {
    promotions,
    subtotal: params.subtotal,
    ...(params.storeId ? { storeId: params.storeId } : {}),
    ...(mappedLines ? { lines: mappedLines } : {}),
  };
}

export type UseValidatePromotionsResult = {
  /** One batch validatePromotions call — do not loop validatePromotion for list open. */
  validatePromotions: (
    input: ValidatePromotionsInput,
  ) => Promise<ValidatePromotionsQuery['validatePromotions'] | undefined>;
  items: PromotionEligibilityItem[];
  loading: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

/**
 * Lazy network-only wrapper for Decision 6 list-time batch eligibility.
 * API surface is batch-only (AC-046); single-code apply stays on useCheckout.validatePromotion.
 */
export function useValidatePromotions(): UseValidatePromotionsResult {
  const [runValidatePromotions, { loading, error, data }] = useLazyQuery(
    ValidatePromotionsDocument,
    { fetchPolicy: 'network-only' },
  );

  const validatePromotions = useCallback(
    async (input: ValidatePromotionsInput) => {
      try {
        const result = await runValidatePromotions({ variables: { input } });
        return result.data?.validatePromotions;
      } catch {
        // Transport / GraphQL whole-query failure → AC-051 via hook error; no invented items.
        return undefined;
      }
    },
    [runValidatePromotions],
  );

  return {
    validatePromotions,
    items: data?.validatePromotions?.items ?? [],
    loading,
    error: toHookError(error),
  };
}
