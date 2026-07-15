'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import { PaymentManual3dsLink } from './PaymentManual3dsLink';
import { PaymentRetryPanel, type PaymentRetryPanelProps } from './PaymentRetryPanel';

const WAITING_COPY = 'กำลังยืนยันการชำระเงิน...';

export type PaymentWaitingAfterReturnStateProps = {
  authorizeUri: string;
  amountLabel: string;
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
};

export function PaymentWaitingAfterReturnState({
  authorizeUri,
  amountLabel,
  onRetrySubmit,
  submitError,
  isSubmitting,
}: PaymentWaitingAfterReturnStateProps) {
  const [recoveryExpanded, setRecoveryExpanded] = useState(false);

  return (
    <div data-testid="payment-waiting-after-return">
      <div className="mt-4 rounded-lg bg-sop-primary-200 px-4 py-2">
        <p className="text-sm text-gray-800">กำลังรอการยืนยันการชำระเงินจากธนาคาร</p>
      </div>

      <div className="mt-4 flex items-center justify-between py-3">
        <p className="font-medium text-gray-800">ยอดชำระรวม</p>
        <p className="font-medium text-gray-800">{amountLabel}</p>
      </div>

      <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300">
        <div className="flex flex-col items-center gap-3 p-6">
          <SpinnerIcon size={{ mobile: 28, desktop: 28 }} />
          <p className="text-sm text-gray-500" aria-live="polite" aria-atomic="true">
            {WAITING_COPY}
          </p>
          <PaymentManual3dsLink authorizeUri={authorizeUri} variant="secondary" />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full max-w-xs"
          onClick={() => setRecoveryExpanded((open) => !open)}
          aria-expanded={recoveryExpanded}
        >
          เปลี่ยนวิธีชำระเงิน
        </Button>
        {recoveryExpanded ? (
          <PaymentRetryPanel
            onSubmit={onRetrySubmit}
            submitError={submitError}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>
    </div>
  );
}
