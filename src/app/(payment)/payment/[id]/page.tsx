'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm';
import type { PaymentRetrySubmitInput } from '@/components/organisms/OrderPaymentForm/PaymentRetryPanel';
import { clearPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { useOrderDetail } from '@/lib/hooks/useOrders';
import { usePayment } from '@/lib/hooks/usePayment';
import { invalidateCustomerOrders } from '@/lib/orders/invalidateCustomerOrders';
import { hasHeldFulfillmentItems } from '@/lib/order-tracking/holdVisibility';
import { isOrderNotPayableError } from '@/lib/payment/orderNotPayable';
import {
  isPaymentOrderCompletedInSession,
  isPaymentRouteClosed,
  markPaymentOrderCompleted,
  shouldHandoffToThankYou,
} from '@/lib/payment/paymentRouteClosed';
import {
  buildPaymentRetryInput,
  clearPriorPayment3dsAutoRedirect,
  mirrorGuestPayTokenForNewPayment,
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

function isCheckoutPath(pathname: string): boolean {
  return pathname === '/checkout' || pathname.startsWith('/checkout/');
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

function PaymentPaidHandoff() {
  return (
    <section
      className="flex w-full max-w-[500px] flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-xl"
      aria-live="polite"
      data-testid="payment-paid-handoff"
    >
      <SpinnerIcon size={{ mobile: 32, desktop: 32 }} />
      <p className="text-sm text-gray-600">ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...</p>
    </section>
  );
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();
  const { createPayment, creatingPayment } = useCheckout();
  const [lookupMode, setLookupMode] = useState<LookupMode>('paymentId');
  const [retrySubmitError, setRetrySubmitError] = useState<string | null>(null);
  const [paymentRecoveryUnavailable, setPaymentRecoveryUnavailable] = useState(false);
  const [heldUnpaidFromError, setHeldUnpaidFromError] = useState(false);
  /** Stay locked after successful createPayment until route unmount (checkout pattern). */
  const [retryNavigating, setRetryNavigating] = useState(false);
  const hasTriedFallback = useRef(false);
  const hasRedirected = useRef(false);

  const [orderStatusForPayment, setOrderStatusForPayment] = useState<string | undefined>(undefined);

  const { payment, loading, error, refetch, confirmingLateSuccess } = usePayment({
    id: lookupMode === 'paymentId' ? routeId : null,
    orderId: lookupMode === 'orderId' ? routeId : null,
    orderStatus: orderStatusForPayment,
  });

  const orderIdForHold = payment?.orderId ?? (lookupMode === 'orderId' ? routeId : undefined);
  const { order } = useOrderDetail(orderIdForHold);
  const heldUnpaidFromOrder = useMemo(
    () => Boolean(order?.items && hasHeldFulfillmentItems(order.items)),
    [order],
  );
  const heldUnpaidBlocked = heldUnpaidFromOrder || heldUnpaidFromError;

  const paymentOrderId = payment?.orderId ?? null;
  const paymentStatus = payment?.status ?? null;
  const effectiveOrderStatus =
    payment?.orderStatus ?? order?.status ?? orderStatusForPayment ?? null;
  const paymentForRoute = payment
    ? {
        status: payment.status,
        orderId: payment.orderId,
        orderStatus: effectiveOrderStatus,
      }
    : null;
  const routeClosed = paymentForRoute ? isPaymentRouteClosed(paymentForRoute) : false;
  const thankYouHandoff = paymentForRoute ? shouldHandoffToThankYou(paymentForRoute) : false;
  const sessionCompleted = isPaymentOrderCompletedInSession(
    paymentOrderId ?? (lookupMode === 'orderId' ? routeId : null),
  );
  const blockPaymentForm = thankYouHandoff || sessionCompleted;

  // Adjust state during render from one preferred value only. Prefer payment.orderStatus,
  // then authenticated order.status; if both are missing (e.g. guest + subscription
  // without orderStatus), keep the previous value so sources cannot oscillate.
  const nextOrderStatus = payment?.orderStatus ?? order?.status;
  if (nextOrderStatus != null && nextOrderStatus !== orderStatusForPayment) {
    setOrderStatusForPayment(nextOrderStatus);
  }

  const redirectToThankYou = useCallback(
    (orderId: string, markCompleted: boolean) => {
      if (hasRedirected.current) {
        return;
      }
      hasRedirected.current = true;
      if (markCompleted) {
        markPaymentOrderCompleted(orderId);
      }
      clearPendingCheckout();
      void invalidateCustomerOrders();
      router.replace(`/thank-you/${orderId}`);
    },
    [router],
  );

  const handlePromptPayComplete = useCallback(() => {
    if (!payment?.orderId) {
      return;
    }
    // Customer ack before paid — allow Back onto the payment page until the order is paid.
    redirectToThankYou(payment.orderId, false);
  }, [payment, redirectToThankYou]);

  const handleCheckStatus = useCallback(() => {
    // Bank transfer: customer acknowledges they transferred. Admin still confirms paid —
    // do not wait for status===paid and do not call any mark-paid mutation.
    if (payment?.paymentMethod === 'bank_transfer' && payment.orderId) {
      redirectToThankYou(payment.orderId, false);
      return;
    }
    return refetch();
  }, [payment, refetch, redirectToThankYou]);

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
    if (hasRedirected.current) {
      return;
    }

    const orderId = paymentOrderId ?? (lookupMode === 'orderId' ? routeId : null);
    if (orderId && isPaymentOrderCompletedInSession(orderId)) {
      redirectToThankYou(orderId, true);
      return;
    }

    if (
      paymentOrderId &&
      paymentStatus &&
      shouldHandoffToThankYou({
        status: paymentStatus,
        orderId: paymentOrderId,
        orderStatus: effectiveOrderStatus,
      })
    ) {
      redirectToThankYou(paymentOrderId, true);
    }
  }, [
    effectiveOrderStatus,
    lookupMode,
    paymentOrderId,
    paymentStatus,
    redirectToThankYou,
    routeId,
  ]);

  useEffect(() => {
    if (paymentStatus !== 'failed') {
      return;
    }

    clearPendingCheckout();
  }, [paymentStatus]);

  useEffect(() => {
    // After paid, do not force the customer back onto /payment from checkout history.
    if (routeClosed || sessionCompleted) {
      return;
    }

    const onPopState = () => {
      if (!isCheckoutPath(window.location.pathname)) {
        return;
      }

      router.replace(`/payment/${routeId}`);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [routeClosed, routeId, router, sessionCompleted]);

  const handleRetryPayment = useCallback(
    async (input: PaymentRetrySubmitInput) => {
      if (!payment?.orderId || !payment.id || confirmingLateSuccess) {
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
            },
            input,
          ),
        );

        const newPaymentId = resolveNewPaymentId(payment.id, created?.id);
        clearPriorPayment3dsAutoRedirect(payment.id);
        mirrorGuestPayTokenForNewPayment({
          orderId: payment.orderId,
          newPaymentId,
          previousPaymentId: payment.id,
        });
        // Keep failed/recovery UI replaced with processing until navigation completes.
        setRetryNavigating(true);
        router.push(`/payment/${newPaymentId}`);
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
    [confirmingLateSuccess, createPayment, payment, router],
  );

  if (blockPaymentForm) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-sop-primary-100 px-4 py-8">
        <PaymentPaidHandoff />
      </main>
    );
  }

  const cancelledOrRefundedClosed =
    routeClosed && paymentForRoute && !shouldHandoffToThankYou(paymentForRoute);

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
        onPromptPayComplete={handlePromptPayComplete}
        onExpired={() => {
          void refetch();
        }}
        onRetryPayment={handleRetryPayment}
        retrySubmitError={retrySubmitError}
        retrySubmitting={creatingPayment || retryNavigating}
        confirmingLateSuccess={confirmingLateSuccess}
        paymentRecoveryUnavailable={
          paymentRecoveryUnavailable || Boolean(cancelledOrRefundedClosed)
        }
        heldUnpaidBlocked={heldUnpaidBlocked}
        orderCreatedAt={order?.createdAt ?? null}
      />
    </main>
  );
}
