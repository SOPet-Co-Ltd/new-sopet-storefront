'use client';

import { SpinnerIcon } from '@/components/atoms/icons/outline';

const FRICTIONLESS_COPY = 'กำลังรอการชำระเงิน...';

export function PaymentWaitingFrictionlessState() {
  return (
    <div
      className="flex flex-col items-center gap-3 p-6"
      data-testid="payment-waiting-frictionless"
    >
      <SpinnerIcon size={{ mobile: 28, desktop: 28 }} />
      <p className="text-sm text-gray-500">{FRICTIONLESS_COPY}</p>
    </div>
  );
}
