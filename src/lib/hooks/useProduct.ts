'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductBySlugDocument,
  ProductByPathDocument,
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

export type UseProductByPathParams = {
  path: string;
  skip?: boolean;
};

export type UseProductByIdParams = {
  id: string;
  skip?: boolean;
};

export type UseProductParams =
  | ({ mode: 'slug' } & UseProductBySlugParams)
  | ({ mode: 'path' } & UseProductByPathParams)
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
 * Resolves a product by UUID, by SEO path (`{productSlug}-{storeSlug}`),
 * or by slug + storeId.
 */
export function useProduct(params: UseProductParams): UseProductResult {
  const slugParams = params.mode === 'slug' ? params : null;
  const pathParams = params.mode === 'path' ? params : null;
  const idParams = params.mode === 'id' ? params : null;

  const slugCanQuery = Boolean(slugParams?.slug && slugParams?.storeId && !slugParams?.skip);
  const pathCanQuery = Boolean(pathParams?.path && !pathParams?.skip);
  const idCanQuery = Boolean(idParams?.id && !idParams?.skip);

  const slugQuery = useQuery(ProductBySlugDocument, {
    variables: { slug: slugParams?.slug ?? '', storeId: slugParams?.storeId ?? '' },
    skip: !slugCanQuery,
  });

  const pathQuery = useQuery(ProductByPathDocument, {
    variables: { path: pathParams?.path ?? '' },
    skip: !pathCanQuery,
    fetchPolicy: 'cache-first',
  });

  const idQuery = useQuery(ProductByIdDocument, {
    variables: { id: idParams?.id ?? '' },
    skip: !idCanQuery,
    fetchPolicy: 'cache-first',
  });

  if (params.mode === 'slug') {
    return {
      product: slugQuery.data?.productBySlug ?? null,
      loading: slugCanQuery && slugQuery.loading,
      error: toHookError(slugQuery.error),
      missingStoreId: Boolean(slugParams?.slug && !slugParams?.storeId && !slugParams?.skip),
    };
  }

  if (params.mode === 'path') {
    return {
      product: pathQuery.data?.productByPath ?? null,
      loading: pathCanQuery && pathQuery.loading,
      error: toHookError(pathQuery.error),
      missingStoreId: false,
    };
  }

  return {
    product: idQuery.data?.product ?? null,
    loading: idCanQuery && idQuery.loading,
    error: toHookError(idQuery.error),
    missingStoreId: false,
  };
}
