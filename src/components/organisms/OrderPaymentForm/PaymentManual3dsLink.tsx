'use client';

import { Button } from '@/components/atoms/Button';

export type PaymentManual3dsLinkProps = {
  authorizeUri: string;
  /** After-return secondary label; defaults to primary CTA label */
  variant?: 'primary' | 'secondary';
};

export function PaymentManual3dsLink({
  authorizeUri,
  variant = 'primary',
}: PaymentManual3dsLinkProps) {
  if (variant === 'secondary') {
    return (
      <a
        href={authorizeUri}
        className="text-sm text-sop-secondary-500 underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        เปิดหน้ายืนยันธนาคารอีกครั้ง
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-sm text-gray-600">
        กรุณากดปุ่มด้านล่างเพื่อไปยังหน้าชำระเงินของผู้ให้บริการ
      </p>
      <Button
        type="button"
        variant="primary"
        className="w-full max-w-xs"
        onClick={() => {
          window.location.href = authorizeUri;
        }}
      >
        ไปชำระเงิน
      </Button>
      <a
        href={authorizeUri}
        className="text-sm text-sop-secondary-500 underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        เปิดลิงก์ชำระเงิน
      </a>
    </div>
  );
}
