'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductReviewsDocument,
  StoreReviewSummaryDocument,
  StoreReviewsDocument,
  type ProductReviewsQuery,
  type StoreReviewSummaryQuery,
  type StoreReviewsQuery,
} from '@/lib/graphql/generated/graphql';

export type ProductReview = ProductReviewsQuery['productReviews'][number];
export type StoreReview = StoreReviewsQuery['storeReviews'][number];
export type StoreReviewSummary = StoreReviewSummaryQuery['storeReviewSummary'];

export type UseReviewsParams = {
  productId?: string;
  storeId?: string;
  skip?: boolean;
};

export type UseReviewsResult = {
  productReviews: ProductReview[];
  storeReviews: StoreReview[];
  storeReviewSummary: StoreReviewSummary | null;
  loading: boolean;
  productReviewsLoading: boolean;
  storeReviewSummaryLoading: boolean;
  storeReviewsLoading: boolean;
  error: Error | undefined;
  storeReviewsError: Error | undefined;
  refetchStoreReviews: () => void;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

/**
 * Combines product-level reviews, store-level review list, and summary for PDP and seller pages.
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
    loading: storeSummaryLoading,
    error: storeSummaryError,
  } = useQuery(StoreReviewSummaryDocument, {
    variables: { storeId: storeId ?? '' },
    skip: skipStore,
  });

  const {
    data: storeReviewsData,
    loading: storeReviewsLoading,
    error: storeReviewsError,
    refetch: refetchStoreReviewsQuery,
  } = useQuery(StoreReviewsDocument, {
    variables: { storeId: storeId ?? '' },
    skip: skipStore,
  });

  const loading =
    (!skipProduct && productLoading) ||
    (!skipStore && (storeSummaryLoading || storeReviewsLoading));

  return {
    productReviews: productData?.productReviews ?? [],
    storeReviews: storeReviewsData?.storeReviews ?? [],
    storeReviewSummary: storeData?.storeReviewSummary ?? null,
    loading,
    productReviewsLoading: !skipProduct && productLoading,
    storeReviewSummaryLoading: !skipStore && storeSummaryLoading,
    storeReviewsLoading: !skipStore && storeReviewsLoading,
    error: toHookError(productError ?? storeSummaryError),
    storeReviewsError: toHookError(storeReviewsError),
    refetchStoreReviews: () => {
      void refetchStoreReviewsQuery();
    },
  };
}
