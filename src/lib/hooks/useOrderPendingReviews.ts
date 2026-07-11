'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { CustomerReviewableItemsDocument } from '@/lib/graphql/generated/graphql';
import type { CustomerReviewableItem } from '@/lib/hooks/useCustomerReviews';

export type UseOrderPendingReviewsResult = {
  pendingReviewItems: CustomerReviewableItem[];
  hasPendingReviews: boolean;
  loading: boolean;
};

export function useOrderPendingReviews(
  orderId: string | undefined,
  enabled = true,
): UseOrderPendingReviewsResult {
  const { data, loading } = useQuery(CustomerReviewableItemsDocument, {
    skip: !enabled || !orderId,
    fetchPolicy: 'cache-and-network',
  });

  const pendingReviewItems = useMemo(
    () => (data?.customerReviewableItems ?? []).filter((item) => item.orderId === orderId),
    [data?.customerReviewableItems, orderId],
  );

  return {
    pendingReviewItems,
    hasPendingReviews: pendingReviewItems.length > 0,
    loading,
  };
}
