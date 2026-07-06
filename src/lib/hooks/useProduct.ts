'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductBySlugDocument,
  ProductByIdDocument,
  type ProductBySlugQuery,
} from '@/lib/graphql/generated/graphql';

/** Full product detail shape from catalog queries. */
export type ProductDetail = NonNullable<ProductBySlugQuery['productBySlug']>;

export type UseProductBySlugParams = {
  slug: string;
  storeId?: string;
  skip?: boolean;
};

export type UseProductByIdParams = {
  id: string;
  skip?: boolean;
};

export type UseProductParams =
  | ({ mode: 'slug' } & UseProductBySlugParams)
  | ({ mode: 'id' } & UseProductByIdParams);

export type UseProductResult = {
  product: ProductDetail | null;
  loading: boolean;
  error: Error | undefined;
  /** True when slug mode is used without storeId (backend requires both). */
  missingStoreId: boolean;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

/**
 * Resolves a product by UUID or by slug + storeId (P0-T9 spike strategy).
 * Slug-only lookup is skipped and surfaces `missingStoreId` until backend supports it.
 */
export function useProduct(params: UseProductParams): UseProductResult {
  const slugParams = params.mode === 'slug' ? params : null;
  const idParams = params.mode === 'id' ? params : null;

  const slugCanQuery = Boolean(slugParams?.slug && slugParams?.storeId && !slugParams?.skip);
  const idCanQuery = Boolean(idParams?.id && !idParams?.skip);

  const slugQuery = useQuery(ProductBySlugDocument, {
    variables: { slug: slugParams?.slug ?? '', storeId: slugParams?.storeId ?? '' },
    skip: !slugCanQuery,
  });

  const idQuery = useQuery(ProductByIdDocument, {
    variables: { id: idParams?.id ?? '' },
    skip: !idCanQuery,
  });

  if (params.mode === 'slug') {
    return {
      product: slugQuery.data?.productBySlug ?? null,
      loading: slugCanQuery && slugQuery.loading,
      error: toHookError(slugQuery.error),
      missingStoreId: Boolean(slugParams?.slug && !slugParams?.storeId && !slugParams?.skip),
    };
  }

  return {
    product: idQuery.data?.product ?? null,
    loading: idCanQuery && idQuery.loading,
    error: toHookError(idQuery.error),
    missingStoreId: false,
  };
}
