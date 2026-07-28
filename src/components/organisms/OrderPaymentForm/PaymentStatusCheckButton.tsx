'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';

export const PAYMENT_STATUS_CHECK_LABEL = 'ตรวจสอบสถานะการชำระเงิน';

export type PaymentStatusCheckButtonProps = {
  onCheckStatus?: () => void | Promise<unknown>;
  className?: string;
};

export function PaymentStatusCheckButton({
  onCheckStatus,
  className = 'w-full max-w-xs',
}: PaymentStatusCheckButtonProps) {
  const [checking, setChecking] = useState(false);

  if (!onCheckStatus) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="primary"
      className={className}
      loading={checking}
      disabled={checking}
      data-testid="payment-status-check"
      onClick={() => {
        setChecking(true);
        void Promise.resolve(onCheckStatus()).finally(() => {
          setChecking(false);
        });
      }}
    >
      {PAYMENT_STATUS_CHECK_LABEL}
    </Button>
  );
}
