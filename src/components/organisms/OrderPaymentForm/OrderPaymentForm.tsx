'use client';

import { Button } from '@/components/atoms/Button';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import type { PaymentRecord } from '@/lib/hooks/usePayment';
import { formatCountdown, usePaymentCountdown } from '@/lib/hooks/usePaymentCountdown';
import { useCallback } from 'react';

export type OrderPaymentFormProps = {
  payment: PaymentRecord | null;
  loading: boolean;
  error: Error | undefined;
  onRetry?: () => void;
  onExpired?: () => void;
};

function formatAmount(amount: number, currency: string): string {
  if (currency === 'THB') {
    return `฿${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export function OrderPaymentForm({
  payment,
  loading,
  error,
  onRetry,
  onExpired,
}: OrderPaymentFormProps) {
  const hasQrCode = Boolean(payment?.qrCodeUrl);
  const handleExpire = useCallback(() => {
    onExpired?.();
  }, [onExpired]);
  const { remainingMs, isExpired } = usePaymentCountdown(
    hasQrCode && payment?.status === 'pending' ? payment.expiresAt : null,
    handleExpire,
  );

  if (error && !payment) {
    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-error-title"
      >
        <h1 id="payment-error-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-600">
            ไม่สามารถโหลดข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={onRetry}
          >
            ลองใหม่
          </Button>
        ) : null}
      </section>
    );
  }

  if (loading && !payment) {
    return (
      <section
        className="flex w-full max-w-[500px] flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-xl"
        aria-busy="true"
        aria-label="กำลังโหลดข้อมูลการชำระเงิน"
      >
        <SpinnerIcon size={{ mobile: 32, desktop: 32 }} />
        <p className="text-sm text-gray-500">กำลังโหลดข้อมูลการชำระเงิน...</p>
      </section>
    );
  }

  if (!payment) {
    return (
      <section className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8">
        <p className="text-center text-sm text-gray-500">ไม่พบข้อมูลการชำระเงิน</p>
      </section>
    );
  }

  if (payment.status === 'failed') {
    const isQrExpired = Boolean(payment.expiresAt);

    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-failed-title"
      >
        <h1 id="payment-failed-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="font-medium text-red-600">
            {isQrExpired
              ? 'QR Code หมดอายุแล้ว กรุณาทำรายการใหม่จากหน้าชำระเงิน'
              : 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'}
          </p>
        </div>
      </section>
    );
  }

  if (payment.status === 'paid') {
    return (
      <section
        className="flex w-full max-w-[500px] flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-xl"
        aria-live="polite"
      >
        <SpinnerIcon size={{ mobile: 32, desktop: 32 }} />
        <p className="text-sm text-gray-600">ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...</p>
      </section>
    );
  }

  const hasRedirectUri = Boolean(payment.authorizeUri);

  if (hasQrCode && isExpired && payment.status === 'pending') {
    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-expired-title"
      >
        <h1 id="payment-expired-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <div
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="font-medium text-amber-800">QR Code หมดอายุแล้ว กำลังอัปเดตสถานะ...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
      aria-labelledby="payment-waiting-title"
    >
      <h1 id="payment-waiting-title" className="text-xl font-bold text-gray-900">
        ชำระเงิน
      </h1>

      <div className="mt-4 rounded-lg bg-sop-primary-200 px-4 py-2">
        <p className="text-sm text-gray-800">
          {hasQrCode
            ? 'ชำระเงินผ่าน QR code ภายในแอปธนาคารของคุณ'
            : 'กรุณาดำเนินการชำระเงินให้เสร็จสิ้น'}
        </p>
        {hasQrCode && remainingMs !== null ? (
          <p className="mt-2 text-sm font-medium text-gray-900" aria-live="polite">
            เวลาที่เหลือ: {formatCountdown(remainingMs)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between py-3">
        <p className="font-medium text-gray-800">ยอดชำระรวม</p>
        <p className="font-medium text-gray-800">
          {formatAmount(payment.amount, payment.currency)}
        </p>
      </div>

      <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300">
        {hasQrCode ? (
          <div className="flex w-full flex-col items-center bg-white p-4">
            <img
              src={payment.qrCodeUrl ?? ''}
              alt="PromptPay QR Code"
              className="w-full max-w-[200px] md:max-w-[250px]"
            />
            <p className="mt-4 text-center text-xs text-gray-400">
              แสกนเพื่อชำระเงินผ่านแอปธนาคารใดก็ได้
            </p>
          </div>
        ) : hasRedirectUri ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="text-sm text-gray-600">
              กรุณากดปุ่มด้านล่างเพื่อไปยังหน้าชำระเงินของผู้ให้บริการ
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full max-w-xs"
              onClick={() => {
                window.location.href = payment.authorizeUri ?? '';
              }}
            >
              ไปชำระเงิน
            </Button>
            <a
              href={payment.authorizeUri ?? ''}
              className="text-sm text-sop-secondary-500 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              เปิดลิงก์ชำระเงิน
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6">
            <SpinnerIcon size={{ mobile: 28, desktop: 28 }} />
            <p className="text-sm text-gray-500">กำลังรอการชำระเงิน...</p>
          </div>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        กำลังรอการชำระเงิน
      </div>
    </section>
  );
}
