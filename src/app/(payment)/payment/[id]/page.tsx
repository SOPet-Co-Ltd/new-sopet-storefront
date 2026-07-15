'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm';
import type { PaymentRetrySubmitInput } from '@/components/organisms/OrderPaymentForm/PaymentRetryPanel';
import { clearPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { usePayment } from '@/lib/hooks/usePayment';
import { invalidateCustomerOrders } from '@/lib/orders/invalidateCustomerOrders';
import {
  buildPaymentRetryInput,
  clearPriorPayment3dsAutoRedirect,
  PaymentRetryError,
  resolveNewPaymentId,
} from '@/lib/payment/submitPaymentRetry';

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
  if (error instanceof PaymentRetryError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'ไม่สามารถสร้างการชำระเงินได้';
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();
  const { createPayment, creatingPayment } = useCheckout();
  const [lookupMode, setLookupMode] = useState<LookupMode>('paymentId');
  const [retrySubmitError, setRetrySubmitError] = useState<string | null>(null);
  const hasTriedFallback = useRef(false);
  const hasRedirected = useRef(false);

  const { payment, loading, error, refetch } = usePayment({
    id: lookupMode === 'paymentId' ? routeId : null,
    orderId: lookupMode === 'orderId' ? routeId : null,
  });

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
    router.replace(`/thank-you/${payment.orderId}`);
  }, [payment?.orderId, payment?.status, router]);

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
            },
            input,
          ),
        );

        const newPaymentId = resolveNewPaymentId(payment.id, created?.id);
        clearPriorPayment3dsAutoRedirect(payment.id);
        router.push(`/payment/${newPaymentId}`);
      } catch (retryError) {
        setRetrySubmitError(retryErrorMessage(retryError));
      }
    },
    [createPayment, payment, router],
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sop-primary-100 px-4 py-8">
      <OrderPaymentForm
        payment={payment}
        loading={loading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
        onExpired={() => {
          void refetch();
        }}
        onRetryPayment={handleRetryPayment}
        retrySubmitError={retrySubmitError}
        retrySubmitting={creatingPayment}
      />
    </main>
  );
}
