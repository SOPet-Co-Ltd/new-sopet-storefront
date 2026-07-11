'use client';

import { Button } from '@/components/atoms/Button';

type OrderTrackingErrorStateProps = {
  onRetry: () => void;
};

export function OrderTrackingErrorState({ onRetry }: OrderTrackingErrorStateProps) {
  return (
    <div role="alert" className="py-8 text-center" data-testid="order-tracking-error">
      <h1 className="mb-3 sop-headline-sm-medium text-sop-neutral-gray-200">
        ไม่สามารถโหลดข้อมูลได้
      </h1>
      <p className="mb-6 sop-body-sm-regular text-sop-neutral-gray-400">
        เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง
      </p>
      <Button variant="primary" onClick={onRetry}>
        ลองอีกครั้ง
      </Button>
    </div>
  );
}
