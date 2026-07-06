'use client';

import { useApolloClient, useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import {
  PaymentByOrderIdDocument,
  PaymentDocument,
  type PaymentQuery,
} from '@/lib/graphql/generated/graphql';

export type PaymentRecord = PaymentQuery['payment'];
export type PaymentStatus = PaymentRecord['status'];

export type PollPaymentParams = {
  id?: string;
  orderId?: string;
  intervalMs?: number;
  maxAttempts?: number;
  onStatus?: (status: PaymentStatus, payment: PaymentRecord) => void;
};

export type PollPaymentResult = {
  status: PaymentStatus;
  payment: PaymentRecord;
};

export type UsePaymentParams = {
  id?: string | null;
  orderId?: string | null;
  pollInterval?: number;
  skip?: boolean;
};

export type UsePaymentResult = {
  payment: PaymentRecord | null;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  poll: (params?: PollPaymentParams) => Promise<PollPaymentResult>;
};

const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_MAX_POLL_ATTEMPTS = 30;

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTerminalStatus(status: PaymentStatus): boolean {
  return status === 'paid' || status === 'failed' || status === 'refunded';
}

export function usePayment({
  id,
  orderId,
  pollInterval = 0,
  skip = false,
}: UsePaymentParams = {}): UsePaymentResult {
  const apolloClient = useApolloClient();
  const queryByOrderId = Boolean(orderId) && !id;
  const shouldQuery = !skip && Boolean(id || orderId);
  const pollIntervalMs = pollInterval > 0 ? pollInterval : undefined;

  const paymentByIdQuery = useQuery(PaymentDocument, {
    variables: { id: id ?? '' },
    skip: !shouldQuery || queryByOrderId,
    pollInterval: pollIntervalMs,
  });

  const paymentByOrderIdQuery = useQuery(PaymentByOrderIdDocument, {
    variables: { orderId: orderId ?? '' },
    skip: !shouldQuery || !queryByOrderId,
    pollInterval: pollIntervalMs,
  });

  const activeQuery = queryByOrderId ? paymentByOrderIdQuery : paymentByIdQuery;

  const payment = useMemo(() => {
    if (queryByOrderId) {
      return paymentByOrderIdQuery.data?.paymentByOrderId ?? null;
    }
    return paymentByIdQuery.data?.payment ?? null;
  }, [paymentByIdQuery.data, paymentByOrderIdQuery.data, queryByOrderId]);

  const poll = useCallback(
    async (params: PollPaymentParams = {}): Promise<PollPaymentResult> => {
      const paymentId = params.id ?? id ?? undefined;
      const paymentOrderId = params.orderId ?? orderId ?? undefined;
      const intervalMs = params.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
      const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_POLL_ATTEMPTS;

      if (!paymentId && !paymentOrderId) {
        throw new Error('usePayment.poll requires id or orderId');
      }

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const currentPayment = paymentId
          ? (
              await apolloClient.query({
                query: PaymentDocument,
                variables: { id: paymentId },
                fetchPolicy: 'network-only',
              })
            ).data?.payment
          : (
              await apolloClient.query({
                query: PaymentByOrderIdDocument,
                variables: { orderId: paymentOrderId ?? '' },
                fetchPolicy: 'network-only',
              })
            ).data?.paymentByOrderId;

        if (!currentPayment) {
          throw new Error('Payment not found');
        }

        params.onStatus?.(currentPayment.status, currentPayment);

        if (isTerminalStatus(currentPayment.status)) {
          return {
            status: currentPayment.status,
            payment: currentPayment,
          };
        }

        if (attempt < maxAttempts - 1) {
          await sleep(intervalMs);
        }
      }

      throw new Error('Payment polling timed out');
    },
    [apolloClient, id, orderId],
  );

  return {
    payment,
    loading: shouldQuery && activeQuery.loading,
    error: toHookError(activeQuery.error),
    refetch: () => activeQuery.refetch(),
    poll,
  };
}
