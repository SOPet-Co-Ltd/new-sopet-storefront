'use client';

import { Button } from '@/components/atoms/Button';
import { sanitizePaymentRedirectUrl } from '@/lib/sanitize-external-url';

export type PaymentManual3dsLinkProps = {
  authorizeUri: string;
  /** After-return secondary label; defaults to primary CTA label */
  variant?: 'primary' | 'secondary';
};

export function PaymentManual3dsLink({
  authorizeUri,
  variant = 'primary',
}: PaymentManual3dsLinkProps) {
  const safeAuthorizeUri = sanitizePaymentRedirectUrl(authorizeUri);

  if (!safeAuthorizeUri) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="text-sm text-gray-600">
          ไม่สามารถเปิดลิงก์ชำระเงินได้ กรุณาติดต่อฝ่ายบริการลูกค้า
        </p>
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <a
        href={safeAuthorizeUri}
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
          window.location.href = safeAuthorizeUri;
        }}
      >
        ไปชำระเงิน
      </Button>
      <a
        href={safeAuthorizeUri}
        className="text-sm text-sop-secondary-500 underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        เปิดลิงก์ชำระเงิน
      </a>
    </div>
  );
}
