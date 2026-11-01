'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  PRODUCT_REVIEWS_INITIAL_LIMIT,
  STORE_REVIEWS_PAGE_SIZE,
} from '@/lib/constants/listPageSize';
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
  /** Server-fetched reviews for first paint (SSR). */
  initialProductReviews?: ProductReview[];
  productPage?: number;
  productLimit?: number;
  storePage?: number;
  storeLimit?: number;
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
 * Product reviews use a progressive page-1 limit. Store reviews are one server page at a time.
 */
export function useReviews({
  productId,
  storeId,
  skip = false,
  initialProductReviews,
  productPage = 1,
  productLimit = PRODUCT_REVIEWS_INITIAL_LIMIT,
  storePage = 1,
  storeLimit = STORE_REVIEWS_PAGE_SIZE,
}: UseReviewsParams): UseReviewsResult {
  const skipProduct = skip || !productId;
  const skipStore = skip || !storeId;

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(ProductReviewsDocument, {
    variables: { productId: productId ?? '', page: productPage, limit: productLimit },
    skip: skipProduct,
  });

  const [carried, setCarried] = useState<{
    productId: string;
    reviews: ProductReview[];
  } | null>(null);

  if (
    productId &&
    productData?.productReviews &&
    (carried?.productId !== productId || carried.reviews !== productData.productReviews)
  ) {
    setCarried({ productId, reviews: productData.productReviews });
  }

  const carriedProductReviews =
    carried && carried.productId === productId ? carried.reviews : undefined;

  const productReviews =
    productData?.productReviews ?? carriedProductReviews ?? initialProductReviews ?? [];

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
    variables: { storeId: storeId ?? '', page: storePage, limit: storeLimit },
    skip: skipStore,
  });

  const productReviewsLoading =
    !skipProduct &&
    productLoading &&
    !productData?.productReviews &&
    carriedProductReviews == null &&
    initialProductReviews == null;

  const loading =
    productReviewsLoading || (!skipStore && (storeSummaryLoading || storeReviewsLoading));

  return {
    productReviews,
    storeReviews: storeReviewsData?.storeReviews ?? [],
    storeReviewSummary: storeData?.storeReviewSummary ?? null,
    loading,
    productReviewsLoading,
    storeReviewSummaryLoading: !skipStore && storeSummaryLoading,
    storeReviewsLoading: !skipStore && storeReviewsLoading,
    error: toHookError(productError ?? storeSummaryError),
    storeReviewsError: toHookError(storeReviewsError),
    refetchStoreReviews: () => {
      void refetchStoreReviewsQuery();
    },
  };
}
