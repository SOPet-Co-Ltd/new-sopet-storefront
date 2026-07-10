'use client';

import { useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  CustomerReviewableItemsDocument,
  MyReviewsDocument,
  type CustomerReviewableItemsQuery,
  type MyReviewsQuery,
} from '@/lib/graphql/generated/graphql';

export type ReviewTab = 'pending' | 'written';

export type CustomerReviewableItem =
  CustomerReviewableItemsQuery['customerReviewableItems'][number];
export type CustomerReview = MyReviewsQuery['myReviews'][number];

export const MY_REVIEWS_DEFAULT_LIMIT = 50;
export const MY_REVIEWS_DEFAULT_OFFSET = 0;

export type UseCustomerReviewsParams = {
  tab: ReviewTab;
};

export type UseCustomerReviewsResult = {
  tab: ReviewTab;
  reviewableItems: CustomerReviewableItem[];
  myReviews: CustomerReview[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useCustomerReviews({ tab }: UseCustomerReviewsParams): UseCustomerReviewsResult {
  const isPending = tab === 'pending';
  const isWritten = tab === 'written';

  const {
    data: pendingData,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useQuery(CustomerReviewableItemsDocument, {
    skip: !isPending,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: writtenData,
    loading: writtenLoading,
    error: writtenError,
    refetch: refetchWritten,
  } = useQuery(MyReviewsDocument, {
    variables: {
      limit: MY_REVIEWS_DEFAULT_LIMIT,
      offset: MY_REVIEWS_DEFAULT_OFFSET,
    },
    skip: !isWritten,
    fetchPolicy: 'cache-and-network',
  });

  const refetch = useCallback(() => {
    if (isPending) {
      return refetchPending();
    }
    return refetchWritten();
  }, [isPending, refetchPending, refetchWritten]);

  return {
    tab,
    reviewableItems: pendingData?.customerReviewableItems ?? [],
    myReviews: writtenData?.myReviews ?? [],
    loading: (isPending && pendingLoading) || (isWritten && writtenLoading),
    error: toHookError(isPending ? pendingError : writtenError),
    refetch,
  };
}
