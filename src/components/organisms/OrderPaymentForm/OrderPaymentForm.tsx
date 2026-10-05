'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { ArrowLeftIcon } from '@/components/atoms/icons';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import type { PaymentRecord } from '@/lib/hooks/usePayment';
import { usePaymentCountdown } from '@/lib/hooks/usePaymentCountdown';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { isAllowed3dsAuthorizeUri } from '@/lib/payment/authorizeUri';
import { hasQrExpiredAt } from '@/lib/payment/orderNotPayable';
import { Payment3dsAutoRedirect, threeDSAutoRedirectStorageKey } from './Payment3dsAutoRedirect';
import { Payment3dsRedirectingState } from './Payment3dsRedirectingState';
import { PaymentFailedState } from './PaymentFailedState';
import { PaymentManual3dsLink } from './PaymentManual3dsLink';
import { PaymentOrderNotPayableState } from './PaymentOrderNotPayableState';
import { PaymentStatusCheckButton } from './PaymentStatusCheckButton';
import { PaymentWaitingAfterReturnState } from './PaymentWaitingAfterReturnState';
import { PaymentWaitingFrictionlessState } from './PaymentWaitingFrictionlessState';
import { PromptPayQrWaitingState } from './PromptPayQrWaitingState';
import { BankTransferWaitingState } from './BankTransferWaitingState';
import { PaymentRetryPanel, type PaymentRetryPanelProps } from './PaymentRetryPanel';
import { PaymentRetryProcessingState } from './PaymentRetryProcessingState';
import { HeldUnpaidPaymentBlock } from './HeldUnpaidPaymentBlock';
import { cn } from '@/lib/utils';

export type OrderPaymentFormProps = {
  payment: PaymentRecord | null;
  loading: boolean;
  error: Error | undefined;
  onRetry?: () => void;
  /** One-shot refetch of payment status from the backend (no continuous polling). */
  onCheckStatus?: () => void | Promise<unknown>;
  /** PromptPay QR: customer confirms they finished paying and goes to the success page. */
  onPromptPayComplete?: () => void;
  onExpired?: () => void;
  /** Test seam / optional override for 3DS auto-redirect navigation */
  navigateToAuthorizeUri?: (uri: string) => void;
  /** Same-order recovery submit (wired to createPayment in frontend-task-04) */
  onRetryPayment?: PaymentRetryPanelProps['onSubmit'];
  retrySubmitError?: PaymentRetryPanelProps['submitError'];
  retrySubmitting?: PaymentRetryPanelProps['isSubmitting'];
  /** Order cancelled / unpaid window closed — hide change-method UI */
  paymentRecoveryUnavailable?: boolean;
  /** Decision #15: any item on_hold while pending payment — block pay / Mid-QR / retry */
  heldUnpaidBlocked?: boolean;
  /** Order createdAt for bank-transfer payment details (Figma). */
  orderCreatedAt?: string | null;
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

/**
 * Keep recovery children mounted while busy so in-flight PaymentRetryPanel can unlock on failure.
 * Visually swap to checkout-like processing (no failed / prior-stage chrome).
 */
function PaymentBusyShell({
  titleId,
  title,
  busy,
  backHref,
  backLabel,
  hideTitle,
  className,
  children,
}: {
  titleId: string;
  title: string;
  busy: boolean;
  backHref?: string;
  backLabel?: string;
  /** When title is rendered by children (e.g. Figma bank-transfer layout). */
  hideTitle?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'w-full max-w-[500px] rounded-[20px] bg-white px-6 py-6 shadow-xl md:px-10 md:py-6',
        className,
      )}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
    >
      {backHref && backLabel ? (
        <Link
          href={backHref}
          data-testid="payment-busy-back"
          className={cn(
            'mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-sop-secondary-500',
            'transition-colors hover:text-sop-secondary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sop-primary-300 focus-visible:ring-offset-2',
          )}
        >
          <ArrowLeftIcon size={{ mobile: 16, desktop: 16 }} color="currentColor" />
          {backLabel}
        </Link>
      ) : null}
      {hideTitle ? null : (
        <h1 id={titleId} className="text-xl font-bold text-gray-900">
          {title}
        </h1>
      )}
      {busy ? <PaymentRetryProcessingState /> : null}
      <div hidden={busy}>{children}</div>
    </section>
  );
}

/** Bank transfer wait: Figma primary CTA = check status; change method collapsed. */
function BankTransferActionsChrome({
  onRetrySubmit,
  submitError,
  isSubmitting,
  onSubmittingChange,
  onCheckStatus,
}: {
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
  onSubmittingChange?: PaymentRetryPanelProps['onSubmittingChange'];
  onCheckStatus?: () => void | Promise<unknown>;
}) {
  const [recoveryExpanded, setRecoveryExpanded] = useState(false);
  const [checking, setChecking] = useState(false);

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      {onCheckStatus ? (
        <Button
          type="button"
          variant="primary"
          size="xl"
          fill
          className="w-full"
          loading={checking}
          disabled={checking}
          data-testid="payment-status-check"
          onClick={() => {
            setChecking(true);
            void Promise.resolve(onCheckStatus()).finally(() => {
              setChecking(false);
            });
          }}
        >
          ยืนยันชำระเงินแล้ว
        </Button>
      ) : null}
      {onRetrySubmit ? (
        <>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sop-neutral-gray-300"
            onClick={() => setRecoveryExpanded((open) => !open)}
            aria-expanded={recoveryExpanded}
          >
            {recoveryExpanded ? 'ปิดวิธีชำระเงินอื่น' : 'เปลี่ยนวิธีชำระเงิน'}
          </Button>
          {recoveryExpanded ? (
            <PaymentRetryPanel
              initialPaymentMethod={null}
              hideBankTransfer
              onSubmit={onRetrySubmit}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onSubmittingChange={onSubmittingChange}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const PROMPT_PAY_COMPLETE_DELAY_MS = 5_000;

/** Inline Mid-QR chrome (UI-LOCK-01 B) — local state resets when branch unmounts. */
function MidQrChangeMethodChrome({
  onComplete,
  onRetrySubmit,
  submitError,
  isSubmitting,
  onSubmittingChange,
}: {
  onComplete?: () => void;
  onRetrySubmit?: PaymentRetryPanelProps['onSubmit'];
  submitError?: PaymentRetryPanelProps['submitError'];
  isSubmitting?: PaymentRetryPanelProps['isSubmitting'];
  onSubmittingChange?: PaymentRetryPanelProps['onSubmittingChange'];
}) {
  const [recoveryExpanded, setRecoveryExpanded] = useState(false);
  const [completeEnabled, setCompleteEnabled] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCompleteEnabled(true);
    }, PROMPT_PAY_COMPLETE_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col items-stretch gap-3">
      <Button
        type="button"
        variant="primary"
        size="xl"
        fill
        className="w-full"
        disabled={!completeEnabled}
        onClick={onComplete}
      >
        ชำระเงินเสร็จสิ้น
      </Button>
      <Button
        type="button"
        variant="neutral"
        size="xl"
        fill
        className="w-full border-sop-neutral-grayalpha-200 font-medium text-sop-neutral-gray-200"
        onClick={() => setRecoveryExpanded((open) => !open)}
        aria-expanded={recoveryExpanded}
      >
        เปลี่ยนช่องทางการชำระเงิน
      </Button>
      {recoveryExpanded ? (
        <PaymentRetryPanel
          hidePromptPay
          onSubmit={onRetrySubmit}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onSubmittingChange={onSubmittingChange}
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
  onCheckStatus,
  onPromptPayComplete,
  onExpired,
  navigateToAuthorizeUri,
  onRetryPayment,
  retrySubmitError,
  retrySubmitting,
  paymentRecoveryUnavailable = false,
  heldUnpaidBlocked = false,
  orderCreatedAt = null,
}: OrderPaymentFormProps) {
  const [panelSubmitting, setPanelSubmitting] = useState(false);
  const isRetryBusy = Boolean(retrySubmitting || panelSubmitting);

  const hasQrCode = Boolean(payment?.qrCodeUrl);
  const handleExpire = useCallback(() => {
    onExpired?.();
  }, [onExpired]);
  const { remainingMs, isExpired } = usePaymentCountdown(
    hasQrCode && payment?.status === 'pending' && !heldUnpaidBlocked ? payment.expiresAt : null,
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

  if (heldUnpaidBlocked && payment) {
    return (
      <section
        className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8"
        aria-labelledby="payment-held-title"
        data-testid="order-payment-form-held-block"
      >
        <h1 id="payment-held-title" className="text-xl font-bold text-gray-900">
          ชำระเงิน
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          ยอดชำระ {formatAmount(payment.amount, payment.currency)}
        </p>
        <HeldUnpaidPaymentBlock />
      </section>
    );
  }

  // Prefer loading over error so a transient failure (e.g. WS subscription) never
  // flashes the load-error panel while the payment query is still resolving.
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

  if (!payment) {
    return (
      <section className="w-full max-w-[500px] rounded-3xl bg-white p-6 shadow-xl md:p-8">
        <p className="text-center text-sm text-gray-500">ไม่พบข้อมูลการชำระเงิน</p>
      </section>
    );
  }

  // Paid handoff takes priority so a successful charge never paints the failed banner.
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

  if (payment.status === 'failed') {
    const isQrExpired = hasQrExpiredAt(payment.expiresAt);

    return (
      <PaymentBusyShell titleId="payment-failed-title" title="ชำระเงิน" busy={isRetryBusy}>
        <PaymentFailedState
          isQrExpired={isQrExpired}
          onRetrySubmit={onRetryPayment}
          submitError={retrySubmitError}
          isSubmitting={retrySubmitting}
          onSubmittingChange={setPanelSubmitting}
        />
      </PaymentBusyShell>
    );
  }

  const authorizeUri = payment.authorizeUri?.trim() ? payment.authorizeUri : null;
  const hasRedirectUri = Boolean(authorizeUri);

  if (hasQrCode && isExpired && payment.status === 'pending') {
    return (
      <PaymentBusyShell titleId="payment-expired-title" title="ชำระเงิน" busy={isRetryBusy}>
        <PaymentFailedState
          isQrExpired
          onRetrySubmit={onRetryPayment}
          submitError={retrySubmitError}
          isSubmitting={retrySubmitting}
          onSubmittingChange={setPanelSubmitting}
        />
      </PaymentBusyShell>
    );
  }

  // Card 3DS path: pending + authorizeUri (PromptPay QR takes precedence when both present)
  if (!hasQrCode && hasRedirectUri && authorizeUri && payment.status === 'pending') {
    const amountLabel = formatAmount(payment.amount, payment.currency);

    if (!isAllowed3dsAuthorizeUri(authorizeUri)) {
      return (
        <PaymentBusyShell titleId="payment-waiting-title" title="ชำระเงิน" busy={isRetryBusy}>
          <div className="mt-4 flex items-center justify-between py-3">
            <p className="font-medium text-gray-800">ยอดชำระรวม</p>
            <p className="font-medium text-gray-800">{amountLabel}</p>
          </div>
          <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300">
            <PaymentManual3dsLink authorizeUri={authorizeUri} />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <PaymentStatusCheckButton onCheckStatus={onCheckStatus} />
          </div>
        </PaymentBusyShell>
      );
    }

    const afterReturn = hasCompleted3dsAutoRedirect(payment.id, authorizeUri);

    return (
      <PaymentBusyShell titleId="payment-waiting-title" title="ชำระเงิน" busy={isRetryBusy}>
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
            onCheckStatus={onCheckStatus}
            onRetrySubmit={onRetryPayment}
            submitError={retrySubmitError}
            isSubmitting={retrySubmitting}
            onSubmittingChange={setPanelSubmitting}
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
      </PaymentBusyShell>
    );
  }

  if (payment.paymentMethod === 'bank_transfer' && payment.status === 'pending') {
    const amountLabel = formatAmount(payment.amount, payment.currency);
    const leaveHref = payment.orderId ? `/user/orders/${payment.orderId}` : '/';
    const leaveLabel = payment.orderId ? 'กลับไปที่คำสั่งซื้อ' : 'กลับหน้าแรก';
    return (
      <PaymentBusyShell
        titleId="payment-bank-transfer-title"
        title="คัดลอกบัญชีธนาคาร เพื่อชำระเงิน"
        busy={isRetryBusy}
        backHref={leaveHref}
        backLabel={leaveLabel}
        hideTitle
      >
        <BankTransferWaitingState
          amountLabel={amountLabel}
          orderNumber={payment.orderNumber}
          orderCreatedAt={orderCreatedAt}
        />
        <BankTransferActionsChrome
          onCheckStatus={onCheckStatus}
          onRetrySubmit={onRetryPayment}
          submitError={retrySubmitError}
          isSubmitting={retrySubmitting}
          onSubmittingChange={setPanelSubmitting}
        />
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          รอการยืนยันการโอนเงินจากเจ้าหน้าที่
        </div>
      </PaymentBusyShell>
    );
  }

  if (hasQrCode) {
    return (
      <PaymentBusyShell
        titleId="payment-waiting-title"
        title="สแกน QR เพื่อชำระเงิน"
        busy={isRetryBusy}
        hideTitle
        className="max-w-[500px] px-4 py-5 md:max-w-[960px] md:px-6 md:py-6"
      >
        <PromptPayQrWaitingState
          qrCodeUrl={payment.qrCodeUrl ?? ''}
          amountLabel={formatAmount(payment.amount, payment.currency)}
          orderNumber={payment.orderNumber}
          orderCreatedAt={orderCreatedAt}
          referenceId={payment.id}
          remainingMs={remainingMs}
          actions={
            <MidQrChangeMethodChrome
              onComplete={onPromptPayComplete}
              onRetrySubmit={onRetryPayment}
              submitError={retrySubmitError}
              isSubmitting={retrySubmitting}
              onSubmittingChange={setPanelSubmitting}
            />
          }
        />
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          กำลังรอการชำระเงิน
        </div>
      </PaymentBusyShell>
    );
  }

  return (
    <PaymentBusyShell titleId="payment-waiting-title" title="ชำระเงิน" busy={isRetryBusy}>
      <div className="mt-4 rounded-lg bg-sop-primary-200 px-4 py-2">
        <p className="text-sm text-gray-800">กรุณาดำเนินการชำระเงินให้เสร็จสิ้น</p>
      </div>

      <div className="mt-4 flex items-center justify-between py-3">
        <p className="font-medium text-gray-800">ยอดชำระรวม</p>
        <p className="font-medium text-gray-800">
          {formatAmount(payment.amount, payment.currency)}
        </p>
      </div>

      <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-300">
        <PaymentWaitingFrictionlessState />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <PaymentStatusCheckButton onCheckStatus={onCheckStatus} />
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        กำลังรอการชำระเงิน
      </div>
    </PaymentBusyShell>
  );
}
