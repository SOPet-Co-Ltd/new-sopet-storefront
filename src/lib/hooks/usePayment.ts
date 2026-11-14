'use client';

import { useApolloClient, useQuery, useSubscription } from '@apollo/client/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  PaymentByOrderIdDocument,
  PaymentDocument,
  PaymentStatusUpdatedDocument,
  type PaymentQuery,
} from '@/lib/graphql/generated/graphql';
import { setWsGuestPayToken } from '@/lib/graphql/wsConnectionParams';
import { persistGuestPayToken, resolveGuestPayToken } from '@/lib/payment/guestPayToken';

/** Widened until codegen includes PaymentType.failureCode. */
export type PaymentRecord = PaymentQuery['payment'] & {
  failureCode?: string | null;
};
export type PaymentStatus = PaymentRecord['status'];

export type PollPaymentParams = {
  id?: string;
  orderId?: string;
  intervalMs?: number;
  maxAttempts?: number;
  onStatus?: (status: PaymentStatus, payment: PaymentRecord) => void;
  guestPayToken?: string | null;
};

export type PollPaymentResult = {
  status: PaymentStatus;
  payment: PaymentRecord;
};

export type UsePaymentParams = {
  id?: string | null;
  orderId?: string | null;
  skip?: boolean;
  guestPayToken?: string | null;
  /**
   * Order status from the order detail query. Missing/undefined is treated as still
   * payable so the late-success PromptPay check can run before order loads.
   */
  orderStatus?: string | null;
};

export type UsePaymentResult = {
  payment: PaymentRecord | null;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  poll: (params?: PollPaymentParams) => Promise<PollPaymentResult>;
  /** True while a one-shot late-success refetch is in flight for a failed PromptPay row. */
  confirmingLateSuccess: boolean;
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

function isOrderStillPayable(orderStatus: string | null | undefined): boolean {
  // Missing order status: treat as still payable so the late-success check can run.
  if (orderStatus == null || orderStatus === '') {
    return true;
  }
  return orderStatus === 'pending_payment';
}

/** Prefer `paid` from either source so a late success is never stuck behind a failed event. */
export function pickFreshestPayment(
  fromSubscription: PaymentRecord | null | undefined,
  fromQuery: PaymentRecord | null | undefined,
): PaymentRecord | null {
  if (fromSubscription && fromQuery) {
    if (fromQuery.status === 'paid') {
      return fromQuery;
    }
    if (fromSubscription.status === 'paid') {
      return fromSubscription;
    }
    if (isTerminalStatus(fromQuery.status) && !isTerminalStatus(fromSubscription.status)) {
      return fromQuery;
    }
    return fromSubscription;
  }

  return fromSubscription ?? fromQuery ?? null;
}

export function usePayment({
  id,
  orderId,
  skip = false,
  guestPayToken,
  orderStatus,
}: UsePaymentParams = {}): UsePaymentResult {
  const apolloClient = useApolloClient();
  const queryByOrderId = Boolean(orderId) && !id;
  const shouldQuery = !skip && Boolean(id || orderId);
  const [lateSuccessCheckedIds, setLateSuccessCheckedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const resolvedGuestPayToken = resolveGuestPayToken({
    guestPayToken,
    paymentId: id,
    orderId,
  });

  useLayoutEffect(() => {
    setWsGuestPayToken(resolvedGuestPayToken);
    return () => setWsGuestPayToken(undefined);
  }, [resolvedGuestPayToken]);

  const paymentByIdQuery = useQuery(PaymentDocument, {
    variables: { id: id ?? '', guestPayToken: resolvedGuestPayToken },
    skip: !shouldQuery || queryByOrderId,
    fetchPolicy: 'network-only',
  });

  const paymentByOrderIdQuery = useQuery(PaymentByOrderIdDocument, {
    variables: { orderId: orderId ?? '', guestPayToken: resolvedGuestPayToken },
    skip: !shouldQuery || !queryByOrderId,
    fetchPolicy: 'network-only',
  });

  const activeQuery = queryByOrderId ? paymentByOrderIdQuery : paymentByIdQuery;

  const subscriptionVariables = useMemo(
    () => ({
      paymentId: queryByOrderId ? null : (id ?? null),
      orderId: queryByOrderId ? (orderId ?? null) : null,
      guestPayToken: resolvedGuestPayToken ?? null,
    }),
    [id, orderId, queryByOrderId, resolvedGuestPayToken],
  );

  const paymentStatusUpdatedSubscription = useSubscription(PaymentStatusUpdatedDocument, {
    variables: subscriptionVariables,
    skip: !shouldQuery || (!id && !orderId),
  });

  const payment = useMemo(() => {
    const fromSubscription = paymentStatusUpdatedSubscription.data?.paymentStatusUpdated;
    const fromQuery = queryByOrderId
      ? (paymentByOrderIdQuery.data?.paymentByOrderId ?? null)
      : (paymentByIdQuery.data?.payment ?? null);

    return pickFreshestPayment(fromSubscription, fromQuery);
  }, [
    paymentByIdQuery.data,
    paymentByOrderIdQuery.data,
    paymentStatusUpdatedSubscription.data,
    queryByOrderId,
  ]);

  useEffect(() => {
    if (!payment?.orderId || !resolvedGuestPayToken) return;
    persistGuestPayToken({
      orderId: payment.orderId,
      paymentId: payment.id,
      token: resolvedGuestPayToken,
    });
  }, [payment?.id, payment?.orderId, resolvedGuestPayToken]);

  const { startPolling, stopPolling } = activeQuery;

  // Hybrid live updates: keep the subscription for fast push when it works, but
  // always HTTP-poll while pending. On UAT/prod the WebSocket often connects
  // without error yet never delivers paymentStatusUpdated — without polling the
  // page stays stuck until a manual check or full refresh. Bank transfer stays
  // manual acknowledgment (admin confirms; no Beam charge to poll).
  // Also keep one poll cycle after PromptPay flips to failed while the order is
  // still pending_payment so a late Beam success can surface as paid.
  useEffect(() => {
    const shouldPollPending =
      shouldQuery && payment?.status === 'pending' && payment.paymentMethod !== 'bank_transfer';

    if (!shouldPollPending) {
      stopPolling();
      return;
    }

    startPolling(DEFAULT_POLL_INTERVAL_MS);
    return () => {
      stopPolling();
    };
  }, [payment?.paymentMethod, payment?.status, shouldQuery, startPolling, stopPolling]);

  // Derived so the retry panel stays hidden as soon as a failed PromptPay row appears.
  const confirmingLateSuccess = Boolean(
    shouldQuery &&
    payment &&
    payment.status === 'failed' &&
    payment.paymentMethod === 'promptpay' &&
    isOrderStillPayable(orderStatus) &&
    !lateSuccessCheckedIds.has(payment.id),
  );

  // One-shot late-success check: failed PromptPay + order still payable → network GET once.
  // queryDeduplication is off so this is not collapsed into the just-finished useQuery.
  useEffect(() => {
    if (!confirmingLateSuccess || !payment) {
      return;
    }

    const paymentId = payment.id;
    let cancelled = false;

    const lateSuccessQuery = queryByOrderId
      ? apolloClient.query({
          query: PaymentByOrderIdDocument,
          variables: {
            orderId: orderId ?? payment.orderId ?? '',
            guestPayToken: resolvedGuestPayToken,
          },
          fetchPolicy: 'network-only',
          context: { queryDeduplication: false },
        })
      : apolloClient.query({
          query: PaymentDocument,
          variables: { id: paymentId, guestPayToken: resolvedGuestPayToken },
          fetchPolicy: 'network-only',
          context: { queryDeduplication: false },
        });

    void lateSuccessQuery
      .catch(() => undefined)
      .finally(() => {
        if (cancelled) {
          return;
        }
        setLateSuccessCheckedIds((prev) => {
          if (prev.has(paymentId)) {
            return prev;
          }
          const next = new Set(prev);
          next.add(paymentId);
          return next;
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    apolloClient,
    confirmingLateSuccess,
    orderId,
    payment,
    queryByOrderId,
    resolvedGuestPayToken,
  ]);

  const poll = useCallback(
    async (params: PollPaymentParams = {}): Promise<PollPaymentResult> => {
      const paymentId = params.id ?? id ?? undefined;
      const paymentOrderId = params.orderId ?? orderId ?? undefined;
      const intervalMs = params.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
      const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_POLL_ATTEMPTS;
      const token = resolveGuestPayToken({
        guestPayToken: params.guestPayToken ?? guestPayToken,
        paymentId,
        orderId: paymentOrderId,
      });

      if (!paymentId && !paymentOrderId) {
        throw new Error('usePayment.poll requires id or orderId');
      }

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const currentPayment = paymentId
          ? (
              await apolloClient.query({
                query: PaymentDocument,
                variables: { id: paymentId, guestPayToken: token },
                fetchPolicy: 'network-only',
              })
            ).data?.payment
          : (
              await apolloClient.query({
                query: PaymentByOrderIdDocument,
                variables: { orderId: paymentOrderId ?? '', guestPayToken: token },
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
    [apolloClient, guestPayToken, id, orderId],
  );

  // Subscription is best-effort live updates. On UAT/prod, WSS often fails (proxy,
  // missing NEXT_PUBLIC_GRAPHQL_WS_URL, Cloudflare) — that must not surface as a
  // "unable to load payment" page error while the HTTP query is still in flight
  // or has already succeeded (card 3DS return → brief error flash → thank-you).
  return {
    payment,
    loading: shouldQuery && activeQuery.loading && !payment,
    error: toHookError(activeQuery.error),
    refetch: () => activeQuery.refetch(),
    poll,
    confirmingLateSuccess,
  };
}
