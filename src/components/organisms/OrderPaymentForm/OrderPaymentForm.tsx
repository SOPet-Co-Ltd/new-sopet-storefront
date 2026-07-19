'use client';

import { Button } from '@/components/atoms/Button';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import type { PaymentRecord } from '@/lib/hooks/usePayment';
import { formatCountdown, usePaymentCountdown } from '@/lib/hooks/usePaymentCountdown';
import { useCallback, useState } from 'react';
import { hasQrExpiredAt } from '@/lib/payment/orderNotPayable';
import { Payment3dsAutoRedirect, threeDSAutoRedirectStorageKey } from './Payment3dsAutoRedirect';
import { Payment3dsRedirectingState } from './Payment3dsRedirectingState';
import { PaymentFailedState } from './PaymentFailedState';
import { PaymentOrderNotPayableState } from './PaymentOrderNotPayableState';
import { PaymentWaitingAfterReturnState } from './PaymentWaitingAfterReturnState';
import { PaymentWaitingFrictionlessState } from './PaymentWaitingFrictionlessState';
import { PaymentRetryPanel, type PaymentRetryPanelProps } from './PaymentRetryPanel';

export type OrderPaymentFormProps = {
  payment: PaymentRecord | null;
  loading: boolean;
  error: Error | undefined;
  onRetry?: () => void;
  onExpired?: () => void;
  /** Test seam / optional override for 3DS auto-redirect navigation */
  navigateToAuthorizeUri?: (uri: string) => void;
  /** Same-order recovery submit (wired to createPayment in frontend-task-04) */
  onRetryPayment?: PaymentRetryPanelProps['onSubmit'];
  retrySubmitError?: PaymentRetryPanelProps['submitError'];
  retrySubmitting?: PaymentRetryPanelProps['isSubmitting'];
  /** Order cancelled / unpaid window closed — hide change-method UI */
  paymentRecoveryUnavailable?: boolean;
};

function formatAmount(amount: number, currency: string): string {
  if (currency === 'THB') {
    return `฿${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

function hasCompleted3dsAutoRedirect(paymentId: string, authorizeUri: string): boolean {
  try {
    return sessionStorage.getItem(threeDSAutoRedirectStorageKey(paymentId)) === authorizeUri;
  } catch {
    return false;
  }
}

/** Inline Mid-QR chrome (UI-LOCK-01 B) — local state resets when branch unmounts. */
function MidQrChangeMethodChrome({
  onRetrySubmit,
  submitError,
  isSubmitting,
}: {
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
}) {
  const [recoveryExpanded, setRecoveryExpanded] = useState(false);

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full max-w-xs"
        onClick={() => setRecoveryExpanded((open) => !open)}
        aria-expanded={recoveryExpanded}
      >
        เปลี่ยนวิธีชำระเงิน
      </Button>
      {recoveryExpanded ? (
        <PaymentRetryPanel
          onSubmit={onRetrySubmit}
          submitError={submitError}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
}

export function OrderPaymentForm({
  payment,
  loading,
  error,
  onRetry,
  onExpired,
  navigateToAuthorizeUri,
  onRetryPayment,
  retrySubmitError,
  retrySubmitting,
  paymentRecoveryUnavailable = false,
}: OrderPaymentFormProps) {
  const hasQrCode = Boolean(payment?.qrCodeUrl);
  const handleExpire = useCallback(() => {
    onExpired?.();
  }, [onExpired]);
  const { remainingMs, isExpired } = usePaymentCountdown(
    hasQrCode && payment?.status === 'pending' ? payment.expiresAt : null,
    handleExpire,
  );

  if (paymentRecoveryUnavailable && payment) {
    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-unavailable-title"
      >
        <h1 id="payment-unavailable-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <PaymentOrderNotPayableState />
      </section>
    );
  }

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
          <Button type="button" variant="outline" className="mt-6 w-full" onClick={onRetry}>
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
    const isQrExpired = hasQrExpiredAt(payment.expiresAt);

    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-failed-title"
      >
        <h1 id="payment-failed-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <PaymentFailedState
          isQrExpired={isQrExpired}
          onRetrySubmit={onRetryPayment}
          submitError={retrySubmitError}
          isSubmitting={retrySubmitting}
        />
      </section>
    );
  }

  if (payment.status === 'paid') {
    return (
      <section
        className="flex w-full max-w-[500px] flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-xl"
        aria-live="polite"
        data-testid="payment-paid-handoff"
      >
        <SpinnerIcon size={{ mobile: 32, desktop: 32 }} />
        <p className="text-sm text-gray-600">ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...</p>
      </section>
    );
  }

  const authorizeUri = payment.authorizeUri?.trim() ? payment.authorizeUri : null;
  const hasRedirectUri = Boolean(authorizeUri);

  if (hasQrCode && isExpired && payment.status === 'pending') {
    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-expired-title"
      >
        <h1 id="payment-expired-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <PaymentOrderNotPayableState />
      </section>
    );
  }

  // Card 3DS path: pending + authorizeUri (PromptPay QR takes precedence when both present)
  if (!hasQrCode && hasRedirectUri && authorizeUri && payment.status === 'pending') {
    const afterReturn = hasCompleted3dsAutoRedirect(payment.id, authorizeUri);
    const amountLabel = formatAmount(payment.amount, payment.currency);

    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-waiting-title"
      >
        <h1 id="payment-waiting-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>

        <Payment3dsAutoRedirect
          paymentId={payment.id}
          status={payment.status}
          authorizeUri={authorizeUri}
          navigate={navigateToAuthorizeUri}
        />

        {afterReturn ? (
          <PaymentWaitingAfterReturnState
            authorizeUri={authorizeUri}
            amountLabel={amountLabel}
            onRetrySubmit={onRetryPayment}
            submitError={retrySubmitError}
            isSubmitting={retrySubmitting}
          />
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between py-3">
              <p className="font-medium text-gray-800">ยอดชำระรวม</p>
              <p className="font-medium text-gray-800">{amountLabel}</p>
            </div>
            <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300">
              <Payment3dsRedirectingState />
            </div>
          </>
        )}
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
        ) : (
          <PaymentWaitingFrictionlessState />
        )}
      </div>

      {hasQrCode ? (
        <MidQrChangeMethodChrome
          onRetrySubmit={onRetryPayment}
          submitError={retrySubmitError}
          isSubmitting={retrySubmitting}
        />
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        กำลังรอการชำระเงิน
      </div>
    </section>
  );
}
