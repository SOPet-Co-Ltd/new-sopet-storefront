'use client';

import { SpinnerIcon } from '@/components/atoms/icons/outline';

const REDIRECTING_COPY = 'กำลังพาไปยังหน้ายืนยันตัวตนของธนาคาร...';

export function Payment3dsRedirectingState() {
  return (
    <div
      className="flex flex-col items-center gap-4 p-6 text-center"
      data-testid="payment-3ds-redirecting"
    >
      <SpinnerIcon size={{ mobile: 28, desktop: 28 }} />
      <p className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
        {REDIRECTING_COPY}
      </p>
    </div>
  );
}
