'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
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
  /** Shipping fee base for shipping-type promos (order total or per-store). */
  shippingFee?: number | null;
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
  const shippingFee =
    params.shippingFee != null && Number.isFinite(params.shippingFee)
      ? params.shippingFee
      : undefined;

  return {
    promotions,
    subtotal: params.subtotal,
    ...(params.storeId ? { storeId: params.storeId } : {}),
    ...(shippingFee != null ? { shippingFee } : {}),
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

function toHookError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error('ValidatePromotions failed');
}

/**
 * One-shot network-only wrapper for Decision 6 list-time batch eligibility.
 * Uses client.query so leaving checkout does not abort the request — an aborted
 * call shows up as a failed ValidatePromotions row in devtools.
 * API surface is batch-only (AC-046); single-code apply stays on useCheckout.validatePromotion.
 */
export function useValidatePromotions(): UseValidatePromotionsResult {
  const client = useApolloClient();
  const mountedRef = useRef(true);
  const [items, setItems] = useState<PromotionEligibilityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validatePromotions = useCallback(
    async (input: ValidatePromotionsInput) => {
      if (mountedRef.current) {
        setLoading(true);
        setError(undefined);
      }

      try {
        const result = await client.query({
          query: ValidatePromotionsDocument,
          variables: { input },
          fetchPolicy: 'network-only',
        });
        const payload = result.data?.validatePromotions;
        if (mountedRef.current) {
          setItems(payload?.items ?? []);
          setLoading(false);
        }
        return payload;
      } catch (caught) {
        // Transport / GraphQL whole-query failure → AC-051 via hook error; no invented items.
        if (mountedRef.current) {
          setItems([]);
          setError(toHookError(caught));
          setLoading(false);
        }
        return undefined;
      }
    },
    [client],
  );

  return {
    validatePromotions,
    items,
    loading,
    error,
  };
}
