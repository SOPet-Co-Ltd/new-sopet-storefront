'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ConfirmOrderDeliveredDocument,
  CustomerOrderListFilter,
  OrdersDocument,
  OrderDocument,
  type OrdersQuery,
  type OrderQuery,
} from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';
import { ORDERS_PAGE_SIZE } from '@/lib/constants/orderListFilters';
import { useAuth } from '@/lib/hooks/useAuth';

const CONFIRM_ORDER_DELIVERED_MUTATION_OPTIONS = {
  refetchQueries: [{ query: OrdersDocument }, { query: OrderDocument }],
  awaitRefetchQueries: true,
};

export type OrderSummary = OrdersQuery['orders']['items'][number];
export type OrderDetail = NonNullable<OrderQuery['order']>;
export type OrdersPagination = OrdersQuery['orders']['pagination'];

export type UseOrdersOptions = {
  page?: number;
  limit?: number;
  filter?: CustomerOrderListFilter;
};

export type UseOrdersResult = {
  orders: OrderSummary[];
  pagination: OrdersPagination | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  fetchOrder: (id: string) => Promise<OrderDetail | null | undefined>;
  confirmOrderDelivered: (orderId: string) => Promise<OrderDetail | null | undefined>;
  confirmingDelivery: boolean;
};

export type UseOrderDetailResult = {
  order: OrderDetail | null | undefined;
  loading: boolean;
  error: Error | undefined;
  confirmOrderDelivered: (orderId: string) => Promise<OrderDetail | null | undefined>;
  confirmingDelivery: boolean;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const { isAuthenticated } = useAuth();
  const page = options.page ?? 1;
  const limit = options.limit ?? ORDERS_PAGE_SIZE;
  const filter = options.filter ?? CustomerOrderListFilter.All;

  const { data, loading, error, refetch } = useQuery(OrdersDocument, {
    skip: !isAuthenticated,
    variables: { page, limit, filter },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const fetchOrder = useCallback(async (id: string) => {
    const result = await getApolloClient().query({
      query: OrderDocument,
      variables: { id },
      fetchPolicy: 'cache-first',
    });
    return result.data?.order;
  }, []);

  const [confirmDeliveryMutation, { loading: confirmingDelivery }] = useMutation(
    ConfirmOrderDeliveredDocument,
    CONFIRM_ORDER_DELIVERED_MUTATION_OPTIONS,
  );

  const confirmOrderDelivered = useCallback(
    async (orderId: string) => {
      const result = await confirmDeliveryMutation({
        variables: { input: { orderId } },
      });
      return result.data?.confirmOrderDelivered;
    },
    [confirmDeliveryMutation],
  );

  return {
    orders: data?.orders.items ?? [],
    pagination: data?.orders.pagination,
    loading: isAuthenticated && loading,
    error: toHookError(error),
    refetch: () => refetch(),
    fetchOrder,
    confirmOrderDelivered,
    confirmingDelivery,
  };
}

export function useOrderDetail(orderId: string | undefined): UseOrderDetailResult {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(OrderDocument, {
    variables: { id: orderId! },
    skip: !isAuthenticated || !orderId,
    fetchPolicy: 'cache-first',
  });

  const [confirmDeliveryMutation, { loading: confirmingDelivery }] = useMutation(
    ConfirmOrderDeliveredDocument,
    CONFIRM_ORDER_DELIVERED_MUTATION_OPTIONS,
  );

  const confirmOrderDelivered = useCallback(
    async (id: string) => {
      const result = await confirmDeliveryMutation({
        variables: { input: { orderId: id } },
      });
      const updated = result.data?.confirmOrderDelivered;
      if (updated) {
        await refetch();
      }
      return updated;
    },
    [confirmDeliveryMutation, refetch],
  );

  return {
    order: data?.order,
    loading: isAuthenticated && loading,
    error: toHookError(error),
    confirmOrderDelivered,
    confirmingDelivery,
  };
}
