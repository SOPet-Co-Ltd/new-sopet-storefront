'use client';

import { Button } from '@/components/atoms/Button';
import { isAllowed3dsAuthorizeUri } from '@/lib/payment/authorizeUri';

export type PaymentManual3dsLinkProps = {
  authorizeUri: string;
  /** After-return secondary label; defaults to primary CTA label */
  variant?: 'primary' | 'secondary';
};

const BLOCKED_COPY =
  'ไม่สามารถเปิดลิงก์ยืนยันการชำระเงินได้อย่างปลอดภัย กรุณากดตรวจสอบสถานะหรือเปลี่ยนวิธีชำระเงิน';

export function PaymentManual3dsLink({
  authorizeUri,
  variant = 'primary',
}: PaymentManual3dsLinkProps) {
  const allowed = isAllowed3dsAuthorizeUri(authorizeUri);

  if (!allowed) {
    if (variant === 'secondary') {
      return (
        <p className="text-sm text-gray-600" role="status">
          {BLOCKED_COPY}
        </p>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <p className="text-sm text-gray-600" role="status">
          {BLOCKED_COPY}
        </p>
      </div>
    );
  }

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
          if (!isAllowed3dsAuthorizeUri(authorizeUri)) {
            return;
          }
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
