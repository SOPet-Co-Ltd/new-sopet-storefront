'use client';

import { Button } from '@/components/atoms/Button';

type ErrorFallbackProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorFallback({
  title = 'เกิดข้อผิดพลาด',
  message = 'ไม่สามารถแสดงหน้านี้ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <h2 className="sop-headline-md-medium text-sop-neutral-gray-100">{title}</h2>
        <p className="mt-2 max-w-md text-sop-neutral-gray-300">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="primary" size="md" onClick={onRetry}>
          ลองใหม่อีกครั้ง
        </Button>
      ) : null}
    </div>
  );
}
