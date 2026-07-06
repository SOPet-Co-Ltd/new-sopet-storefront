'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductReviewsDocument,
  StoreReviewSummaryDocument,
  type ProductReviewsQuery,
  type StoreReviewSummaryQuery,
} from '@/lib/graphql/generated/graphql';

export type ProductReview = ProductReviewsQuery['productReviews'][number];
export type StoreReviewSummary = StoreReviewSummaryQuery['storeReviewSummary'];

export type UseReviewsParams = {
  productId?: string;
  storeId?: string;
  skip?: boolean;
};

export type UseReviewsResult = {
  productReviews: ProductReview[];
  storeReviewSummary: StoreReviewSummary | null;
  loading: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

/**
 * Combines product-level reviews and store-level review summary for PDP and seller pages.
 */
export function useReviews({
  productId,
  storeId,
  skip = false,
}: UseReviewsParams): UseReviewsResult {
  const skipProduct = skip || !productId;
  const skipStore = skip || !storeId;

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(ProductReviewsDocument, {
    variables: { productId: productId ?? '' },
    skip: skipProduct,
  });

  const {
    data: storeData,
    loading: storeLoading,
    error: storeError,
  } = useQuery(StoreReviewSummaryDocument, {
    variables: { storeId: storeId ?? '' },
    skip: skipStore,
  });

  const loading =
    (!skipProduct && productLoading) || (!skipStore && storeLoading);

  return {
    productReviews: productData?.productReviews ?? [],
    storeReviewSummary: storeData?.storeReviewSummary ?? null,
    loading,
    error: toHookError(productError ?? storeError),
  };
}
