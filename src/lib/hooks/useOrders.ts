'use client';

import { useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  OrdersDocument,
  OrderDocument,
  GuestOrdersDocument,
  type OrdersQuery,
  type OrderQuery,
} from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';
import { useAuth } from '@/lib/hooks/useAuth';

export type OrderSummary = OrdersQuery['orders'][number];
export type OrderDetail = NonNullable<OrderQuery['order']>;

export type UseOrdersResult = {
  orders: OrderSummary[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  fetchOrder: (id: string) => Promise<OrderDetail | null | undefined>;
  fetchGuestOrders: (guestPhone: string) => Promise<OrderSummary[]>;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useOrders(): UseOrdersResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(OrdersDocument, {
    skip: !isAuthenticated,
  });

  const fetchOrder = useCallback(async (id: string) => {
    const result = await getApolloClient().query({
      query: OrderDocument,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return result.data?.order;
  }, []);

  const fetchGuestOrders = useCallback(async (guestPhone: string) => {
    const result = await getApolloClient().query({
      query: GuestOrdersDocument,
      variables: { guestPhone },
      fetchPolicy: 'network-only',
    });
    return result.data?.guestOrders ?? [];
  }, []);

  return {
    orders: data?.orders ?? [],
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    fetchOrder,
    fetchGuestOrders,
  };
}
