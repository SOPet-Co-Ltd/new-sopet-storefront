'use client';

import { getBeamFailureMessage } from '@/lib/payment/beamFailureCodes';
import { PaymentRetryPanel, type PaymentRetryPanelProps } from './PaymentRetryPanel';

export type PaymentFailedStateProps = {
  isQrExpired: boolean;
  /** Beam charge failureCode when status is failed (e.g. CH_CARD_DECLINED). */
  failureCode?: string | null;
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
  onSubmittingChange?: PaymentRetryPanelProps['onSubmittingChange'];
};

export function PaymentFailedState({
  isQrExpired,
  failureCode = null,
  onRetrySubmit,
  submitError,
  isSubmitting,
  onSubmittingChange,
}: PaymentFailedStateProps) {
  const failureMessage = isQrExpired
    ? 'QR Code หมดอายุแล้ว กรุณาเลือกวิธีชำระเงินใหม่'
    : getBeamFailureMessage(failureCode);

  return (
    <div data-testid="payment-failed-state">
      <div
        className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
        role="alert"
        aria-live="polite"
        data-failure-code={failureCode ?? undefined}
      >
        <p className="font-medium text-red-600">{failureMessage}</p>
      </div>

      <PaymentRetryPanel
        onSubmit={onRetrySubmit}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSubmittingChange={onSubmittingChange}
      />
    </div>
  );
}
