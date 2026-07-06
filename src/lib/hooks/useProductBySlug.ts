'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductBySlugDocument,
  ProductByIdDocument,
  type ProductBySlugQuery,
} from '@/lib/graphql/generated/graphql';

/** Minimal product shape returned by slug/id spike queries. */
export type ProductDetail = NonNullable<ProductBySlugQuery['productBySlug']>;

export type UseProductBySlugParams = {
  /** URL path segment `[handle]` — maps to GraphQL `slug`. */
  slug: string;
  /**
   * Seller scope for `productBySlug`. Required by current backend schema.
   * Omit only when the page cannot resolve store context (see spike doc TBD-01).
   */
  storeId?: string;
  skip?: boolean;
};

export type UseProductBySlugResult = {
  product: ProductDetail | null;
  loading: boolean;
  error: Error | undefined;
  /** True when `storeId` was not supplied and the query was skipped. */
  missingStoreId: boolean;
};

/**
 * Spike hook for PDP slug resolution (P0-T9).
 * Uses `productBySlug(slug, storeId)` when storeId is known; skips otherwise.
 * P1-T5 page should pass storeId from list-card navigation or await backend slug-only support.
 */
export function useProductBySlug({
  slug,
  storeId,
  skip = false,
}: UseProductBySlugParams): UseProductBySlugResult {
  const canQuery = Boolean(slug && storeId && !skip);

  const { data, loading, error } = useQuery(ProductBySlugDocument, {
    variables: { slug, storeId: storeId ?? '' },
    skip: !canQuery,
  });

  return {
    product: data?.productBySlug ?? null,
    loading: canQuery && loading,
    error: error as Error | undefined,
    missingStoreId: Boolean(slug && !storeId && !skip),
  };
}

export type UseProductByIdParams = {
  id: string;
  skip?: boolean;
};

/**
 * Fallback fetch path when the caller already holds a product UUID (cart, order history).
 */
export function useProductById({ id, skip = false }: UseProductByIdParams) {
  const { data, loading, error } = useQuery(ProductByIdDocument, {
    variables: { id },
    skip: skip || !id,
  });

  return {
    product: data?.product ?? null,
    loading: !skip && Boolean(id) && loading,
    error: error as Error | undefined,
  };
}
