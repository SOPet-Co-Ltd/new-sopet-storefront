'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm';
import type { PaymentRetrySubmitInput } from '@/components/organisms/OrderPaymentForm/PaymentRetryPanel';
import {
  clearPendingCheckout,
  getPendingCheckout,
  setPendingCheckout,
} from '@/lib/checkout/pendingCheckout';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { useOrderDetail } from '@/lib/hooks/useOrders';
import { usePayment } from '@/lib/hooks/usePayment';
import { invalidateCustomerOrders } from '@/lib/orders/invalidateCustomerOrders';
import { hasHeldFulfillmentItems } from '@/lib/order-tracking/holdVisibility';
import { isOrderNotPayableError } from '@/lib/payment/orderNotPayable';
import {
  buildPaymentRetryInput,
  clearPriorPayment3dsAutoRedirect,
  PaymentRetryError,
  resolveNewPaymentId,
} from '@/lib/payment/submitPaymentRetry';
import {
  isPaymentHeldPortionBlockedError,
  mapPaymentHeldPortionBlockedError,
} from '@/lib/store-suspension/mapSuspensionErrors';

type LookupMode = 'paymentId' | 'orderId';

function isPaymentNotFoundError(error: Error | undefined): boolean {
  if (!error) return false;

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((graphError) => {
      const code = graphError.extensions?.code;
      return code === 'PAYMENT_NOT_FOUND' || code === 'NOT_FOUND';
    });
  }

  return false;
}

function retryErrorMessage(error: unknown): string {
  const heldMessage = mapPaymentHeldPortionBlockedError(error);
  if (heldMessage) {
    return heldMessage;
  }
  if (error instanceof PaymentRetryError) {
    return error.message;
  }
  return getErrorMessage(error, 'ไม่สามารถสร้างการชำระเงินได้');
}

function withOrderNumberQuery(path: string, orderNumber: string | null | undefined): string {
  const trimmed = orderNumber?.trim();
  if (!trimmed) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}orderNumber=${encodeURIComponent(trimmed)}`;
}

function resolveGuestOrderNumberProof(options: {
  fromUrl: string | null;
  fromPending: string | null | undefined;
  fromPayment: string | null | undefined;
}): string | null {
  for (const candidate of [options.fromUrl, options.fromPending, options.fromPayment]) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { createPayment, creatingPayment } = useCheckout();
  const [lookupMode, setLookupMode] = useState<LookupMode>('paymentId');
  const [retrySubmitError, setRetrySubmitError] = useState<string | null>(null);
  const [paymentRecoveryUnavailable, setPaymentRecoveryUnavailable] = useState(false);
  const [heldUnpaidFromError, setHeldUnpaidFromError] = useState(false);
  /** Stay locked after successful createPayment until route unmount (checkout pattern). */
  const [retryNavigating, setRetryNavigating] = useState(false);
  const hasTriedFallback = useRef(false);
  const hasRedirected = useRef(false);

  const orderNumberFromUrl = searchParams.get('orderNumber');
  const pendingCheckout = useMemo(() => getPendingCheckout(), []);
  const pendingOrderNumber =
    pendingCheckout &&
    (pendingCheckout.paymentId === routeId || pendingCheckout.orderId === routeId)
      ? pendingCheckout.orderNumber
      : null;

  const guestOrderNumberProof = !isAuthenticated
    ? resolveGuestOrderNumberProof({
        fromUrl: orderNumberFromUrl,
        fromPending: pendingOrderNumber,
        fromPayment: null,
      })
    : null;

  const { payment, loading, error, refetch } = usePayment({
    id: lookupMode === 'paymentId' ? routeId : null,
    orderId: lookupMode === 'orderId' ? routeId : null,
    orderNumber: guestOrderNumberProof,
  });

  const orderNumberForGuestActions = !isAuthenticated
    ? resolveGuestOrderNumberProof({
        fromUrl: orderNumberFromUrl,
        fromPending: pendingOrderNumber,
        fromPayment: payment?.orderNumber,
      })
    : null;

  const orderIdForHold = payment?.orderId ?? (lookupMode === 'orderId' ? routeId : undefined);
  const { order } = useOrderDetail(orderIdForHold);
  const heldUnpaidFromOrder = useMemo(
    () => Boolean(order?.items && hasHeldFulfillmentItems(order.items)),
    [order],
  );
  const heldUnpaidBlocked = heldUnpaidFromOrder || heldUnpaidFromError;

  const handleCheckStatus = useCallback(() => refetch(), [refetch]);

  useEffect(() => {
    if (lookupMode !== 'paymentId' || hasTriedFallback.current || loading) {
      return;
    }

    if (isPaymentNotFoundError(error)) {
      hasTriedFallback.current = true;
      queueMicrotask(() => setLookupMode('orderId'));
    }
  }, [lookupMode, loading, error]);

  useEffect(() => {
    if (hasRedirected.current || payment?.status !== 'paid' || !payment.orderId) {
      return;
    }

    hasRedirected.current = true;
    clearPendingCheckout();
    void invalidateCustomerOrders();
    router.replace(
      withOrderNumberQuery(
        `/thank-you/${payment.orderId}`,
        payment.orderNumber ?? orderNumberForGuestActions,
      ),
    );
  }, [orderNumberForGuestActions, payment?.orderId, payment?.orderNumber, payment?.status, router]);

  useEffect(() => {
    if (payment?.status !== 'failed') {
      return;
    }

    clearPendingCheckout();
  }, [payment?.status]);

  const handleRetryPayment = useCallback(
    async (input: PaymentRetrySubmitInput) => {
      if (!payment?.orderId || !payment.id) {
        return;
      }

      setRetrySubmitError(null);

      try {
        const created = await createPayment(
          buildPaymentRetryInput(
            {
              orderId: payment.orderId,
              amount: payment.amount,
              currency: payment.currency,
              currentPaymentId: payment.id,
              orderNumber: orderNumberForGuestActions,
            },
            input,
          ),
        );

        const newPaymentId = resolveNewPaymentId(payment.id, created?.id);
        clearPriorPayment3dsAutoRedirect(payment.id);
        const nextOrderNumber =
          created?.orderNumber ?? payment.orderNumber ?? orderNumberForGuestActions ?? null;
        setPendingCheckout({
          paymentId: newPaymentId,
          orderId: payment.orderId,
          orderNumber: nextOrderNumber,
        });
        // Keep failed/recovery UI replaced with processing until navigation completes.
        setRetryNavigating(true);
        router.push(withOrderNumberQuery(`/payment/${newPaymentId}`, nextOrderNumber));
      } catch (retryError) {
        setRetryNavigating(false);
        if (isOrderNotPayableError(retryError)) {
          setPaymentRecoveryUnavailable(true);
          setRetrySubmitError(null);
          throw retryError;
        }
        if (isPaymentHeldPortionBlockedError(retryError)) {
          setHeldUnpaidFromError(true);
          setRetrySubmitError(STORE_SUSPENSION_HOLD_COPY.paymentHeldBlocked);
          throw retryError;
        }
        const message = retryErrorMessage(retryError);
        setRetrySubmitError(message);
        throw retryError instanceof Error ? retryError : new Error(message);
      }
    },
    [createPayment, orderNumberForGuestActions, payment, router],
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sop-primary-100 px-4 py-8">
      <OrderPaymentForm
        payment={payment}
        loading={loading || (lookupMode === 'paymentId' && isPaymentNotFoundError(error))}
        error={lookupMode === 'paymentId' && isPaymentNotFoundError(error) ? undefined : error}
        onRetry={() => {
          void refetch();
        }}
        onCheckStatus={handleCheckStatus}
        onExpired={() => {
          void refetch();
        }}
        onRetryPayment={handleRetryPayment}
        retrySubmitError={retrySubmitError}
        retrySubmitting={creatingPayment || retryNavigating}
        paymentRecoveryUnavailable={paymentRecoveryUnavailable}
        heldUnpaidBlocked={heldUnpaidBlocked}
        orderCreatedAt={order?.createdAt ?? null}
      />
    </main>
  );
}
