'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm';
import { clearPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { usePayment } from '@/lib/hooks/usePayment';

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

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const router = useRouter();
  const [lookupMode, setLookupMode] = useState<LookupMode>('paymentId');
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
    if (
      hasRedirected.current ||
      payment?.status !== 'paid' ||
      !payment.orderId
    ) {
      return;
    }

    hasRedirected.current = true;
    clearPendingCheckout();
    router.replace(`/thank-you/${payment.orderId}`);
  }, [payment?.orderId, payment?.status, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sop-primary-100 px-4 py-8">
      <OrderPaymentForm
        payment={payment}
        loading={loading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    </main>
  );
}
