'use client';

import { SpinnerIcon } from '@/components/atoms/icons/outline';

const PROCESSING_COPY = 'กำลังดำเนินการ...';

/** Checkout-like processing stage while retry createPayment / tokenize is in flight. */
export function PaymentRetryProcessingState() {
  return (
    <div
      className="mt-6 flex flex-col items-center gap-4 py-8"
      data-testid="payment-retry-processing"
      aria-busy="true"
      aria-live="polite"
    >
      <SpinnerIcon size={{ mobile: 32, desktop: 32 }} />
      <p className="text-sm text-gray-600">{PROCESSING_COPY}</p>
    </div>
  );
}
