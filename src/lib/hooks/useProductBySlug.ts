'use client';

import {
  useProduct,
  type ProductDetail,
  type UseProductByIdParams,
  type UseProductBySlugParams,
  type UseProductResult,
} from './useProduct';

export type { ProductDetail, UseProductBySlugParams };
export type UseProductBySlugResult = UseProductResult;

/**
 * @deprecated Use `useProduct({ mode: 'slug', ... })` instead.
 * Thin wrapper retained for P0-T9 spike callers during migration.
 */
export function useProductBySlug(params: UseProductBySlugParams): UseProductBySlugResult {
  return useProduct({ mode: 'slug', ...params });
}

/**
 * @deprecated Use `useProduct({ mode: 'id', ... })` instead.
 */
export function useProductById(params: UseProductByIdParams) {
  const result: UseProductResult = useProduct({ mode: 'id', ...params });
  return {
    product: result.product,
    loading: result.loading,
    error: result.error,
  };
}
