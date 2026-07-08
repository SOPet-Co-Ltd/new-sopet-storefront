'use client';

import { Button } from '@/components/atoms/Button';

type CheckoutAddressErrorStateProps = {
  message?: string;
  onRetry: () => void | Promise<unknown>;
  isRetrying?: boolean;
};

export function CheckoutAddressErrorState({
  message = 'ไม่สามารถโหลดที่อยู่ได้ กรุณาลองอีกครั้ง',
  onRetry,
  isRetrying = false,
}: CheckoutAddressErrorStateProps) {
  return (
    <div role="alert" className="space-y-sop-12px" data-testid="address-error">
      <p className="sop-body-sm-regular text-sop-system-error-500">{message}</p>
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={isRetrying}
        loading={isRetrying}
        onClick={() => {
          void onRetry();
        }}
        data-testid="address-retry-button"
      >
        ลองอีกครั้ง
      </Button>
    </div>
  );
}
