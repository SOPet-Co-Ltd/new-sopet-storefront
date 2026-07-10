'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { CustomerReviewableItemsDocument } from '@/lib/graphql/generated/graphql';
import type { OrderSummary } from '@/lib/hooks/useOrders';

export type UseOrdersReviewStatusResult = {
  isOrderFullyReviewed: (orderId: string, status: string) => boolean;
  loading: boolean;
};

export function useOrdersReviewStatus(orders: OrderSummary[]): UseOrdersReviewStatusResult {
  const deliveredOrderIds = useMemo(
    () => orders.filter((order) => order.status === 'delivered').map((order) => order.id),
    [orders],
  );

  const { data, loading } = useQuery(CustomerReviewableItemsDocument, {
    skip: deliveredOrderIds.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const pendingReviewOrderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of data?.customerReviewableItems ?? []) {
      if (deliveredOrderIds.includes(item.orderId)) {
        ids.add(item.orderId);
      }
    }
    return ids;
  }, [data?.customerReviewableItems, deliveredOrderIds]);

  const isOrderFullyReviewed = useCallback(
    (orderId: string, status: string) =>
      status === 'delivered' &&
      deliveredOrderIds.includes(orderId) &&
      !pendingReviewOrderIds.has(orderId) &&
      !loading,
    [deliveredOrderIds, pendingReviewOrderIds, loading],
  );

  return { isOrderFullyReviewed, loading };
}
