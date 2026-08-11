'use client';

import { PaymentRetryPanel, type PaymentRetryPanelProps } from './PaymentRetryPanel';

export type PaymentFailedStateProps = {
  isQrExpired: boolean;
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
  onSubmittingChange?: PaymentRetryPanelProps['onSubmittingChange'];
};

export function PaymentFailedState({
  isQrExpired,
  onRetrySubmit,
  submitError,
  isSubmitting,
  onSubmittingChange,
}: PaymentFailedStateProps) {
  return (
    <div data-testid="payment-failed-state">
      <div
        className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
        role="alert"
        aria-live="polite"
      >
        <p className="font-medium text-red-600">
          {isQrExpired
            ? 'QR Code หมดอายุแล้ว กรุณาเลือกวิธีชำระเงินใหม่'
            : 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'}
        </p>
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
