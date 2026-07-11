'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useQuery } from '@apollo/client/react';
import { OrderTrackingDocument, type OrderTrackingQuery } from '@/lib/graphql/generated/graphql';

export type OrderTrackingQueryState =
  | { status: 'loading' }
  | { status: 'success'; data: OrderTrackingQuery['orderTracking'] }
  | { status: 'not-found' }
  | { status: 'error'; error: Error };

export type UseOrderTrackingResult = {
  orderNumber: string;
  queryState: OrderTrackingQueryState;
  refetch: () => void;
};

function toHookError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

function isOrderNotFoundError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) {
    return false;
  }

  return error.errors.some((graphError) => graphError.extensions?.code === 'ORDER_NOT_FOUND');
}

export function classifyOrderTrackingQueryState(input: {
  shouldSkip: boolean;
  loading: boolean;
  error: unknown;
  data: OrderTrackingQuery['orderTracking'] | undefined;
}): OrderTrackingQueryState {
  const { shouldSkip, loading, error, data } = input;

  if (shouldSkip) {
    return { status: 'not-found' };
  }

  if (loading) {
    return { status: 'loading' };
  }

  if (data) {
    return { status: 'success', data };
  }

  if (error) {
    if (isOrderNotFoundError(error)) {
      return { status: 'not-found' };
    }

    return { status: 'error', error: toHookError(error) };
  }

  return { status: 'not-found' };
}

export function useOrderTracking(orderNumber: string | undefined): UseOrderTrackingResult {
  const trimmedOrderNumber = orderNumber?.trim() ?? '';
  const shouldSkip = !trimmedOrderNumber;

  const { data, loading, error, refetch } = useQuery(OrderTrackingDocument, {
    variables: { orderNumber: trimmedOrderNumber },
    skip: shouldSkip,
    fetchPolicy: 'network-only',
  });

  return {
    orderNumber: trimmedOrderNumber,
    queryState: classifyOrderTrackingQueryState({
      shouldSkip,
      loading,
      error,
      data: data?.orderTracking,
    }),
    refetch: () => {
      void refetch();
    },
  };
}
