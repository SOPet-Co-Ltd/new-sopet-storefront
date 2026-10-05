'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { formatCountdown } from '@/lib/hooks/usePaymentCountdown';

type PromptPayQrWaitingStateProps = {
  qrCodeUrl: string;
  amountLabel: string;
  orderNumber?: string | null;
  orderCreatedAt?: string | null;
  referenceId: string;
  remainingMs: number | null;
  actions?: ReactNode;
};

/** Omise PromptPay document: 740×1050, navy header band is the top 176px. */
const OMISE_QR_WIDTH = 740;
const OMISE_QR_HEADER = 176;
const OMISE_QR_BODY = 1050 - OMISE_QR_HEADER;

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.25v7.19M5.25 7.25 8 10l2.75-2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.25 12.75h9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

async function saveQrCode(qrCodeUrl: string) {
  const filename = 'promptpay-qr.png';

  if (qrCodeUrl.startsWith('data:')) {
    const anchor = document.createElement('a');
    anchor.href = qrCodeUrl;
    anchor.download = filename;
    anchor.click();
    return;
  }

  const response = await fetch(qrCodeUrl);
  if (!response.ok) {
    throw new Error('QR download failed');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function DownloadQrButton({ qrCodeUrl }: { qrCodeUrl: string }) {
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveQrCode(qrCodeUrl);
    } catch {
      window.open(qrCodeUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSaving(false);
    }
  }, [qrCodeUrl]);

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="px-5"
      loading={saving}
      disabled={saving}
      iconLeft={<DownloadIcon />}
      onClick={() => void onSave()}
    >
      บันทึก QR Code
    </Button>
  );
}

function PaymentCountdown({
  remainingMs,
  accentLabel = false,
}: {
  remainingMs: number;
  /** Desktop slip timer sits on a pink bar — keep both labels accent-colored. */
  accentLabel?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 text-sm font-medium">
      <span className={accentLabel ? 'text-sop-secondary-600' : 'text-sop-neutral-gray-200'}>
        กรุณาชำระเงินภายใน
      </span>
      <span className="shrink-0 tabular-nums text-sop-secondary-600" aria-live="polite">
        {formatCountdown(remainingMs)} นาที
      </span>
    </div>
  );
}

function QrSlipCard({ qrCodeUrl, countdown }: { qrCodeUrl: string; countdown?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-sop-neutral-grayalpha-200 bg-white">
      {/* Official Thai QR header is the top band of the Omise document. */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: `${OMISE_QR_WIDTH} / ${OMISE_QR_HEADER}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Omise QR document */}
        <img
          src={qrCodeUrl}
          alt=""
          aria-hidden
          className="absolute inset-x-0 top-0 w-full max-w-none"
        />
      </div>
      {countdown}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: `${OMISE_QR_WIDTH} / ${OMISE_QR_BODY}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Omise QR document */}
        <img
          src={qrCodeUrl}
          alt="PromptPay QR Code"
          className="absolute inset-x-0 w-full max-w-none"
          style={{ top: `calc(${OMISE_QR_HEADER} / ${OMISE_QR_BODY} * -100%)` }}
        />
      </div>
      <div className="flex justify-center px-4 pb-5 pt-1">
        <DownloadQrButton qrCodeUrl={qrCodeUrl} />
      </div>
    </div>
  );
}

function PaymentDetailsCard({
  amountLabel,
  orderNumber,
  orderDateLabel,
}: {
  amountLabel: string;
  orderNumber?: string | null;
  orderDateLabel: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-sop-neutral-gray-500 p-4">
      <p className="text-lg font-semibold leading-7 text-sop-primary-500">รายละเอียดการชำระเงิน</p>
      <div className="flex flex-col gap-1">
        {orderNumber ? (
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium text-[#232323]">รหัสคำสั่งซื้อ</p>
            <p className="text-right text-sm font-semibold text-sop-base-black">{orderNumber}</p>
          </div>
        ) : null}
        {orderDateLabel ? (
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium text-[#232323]">วันที่สั่งซื้อ</p>
            <p className="text-right text-sm font-semibold text-sop-base-black">{orderDateLabel}</p>
          </div>
        ) : null}
      </div>
      <div className="h-px w-full bg-sop-neutral-grayalpha-200" />
      <div className="flex items-center gap-2">
        <p className="flex-1 text-lg font-semibold leading-7 text-sop-neutral-gray-300">
          ยอดชำระเงิน
        </p>
        <p className="text-right text-2xl font-semibold leading-9 text-sop-secondary-600">
          {amountLabel}
        </p>
      </div>
    </div>
  );
}

function ReferenceIdCard({ referenceId }: { referenceId: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-sop-neutral-gray-500 p-4">
      <p className="text-base font-semibold text-[#232323]">รหัสอ้างอิงการชำระเงิน</p>
      <div className="flex items-start justify-between gap-3">
        <p className="shrink-0 text-base font-medium text-[#232323]">Reference ID</p>
        <p className="min-w-0 break-all text-right text-sm font-semibold text-sop-base-black">
          {referenceId}
        </p>
      </div>
    </div>
  );
}

export function PromptPayQrWaitingState({
  qrCodeUrl,
  amountLabel,
  orderNumber,
  orderCreatedAt,
  referenceId,
  remainingMs,
  actions,
}: PromptPayQrWaitingStateProps) {
  const orderDateLabel = orderCreatedAt ? formatThaiDateTime(orderCreatedAt) : null;

  return (
    <div
      className="flex w-full flex-col gap-4 md:grid md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] md:items-start md:gap-6"
      data-testid="promptpay-qr-waiting"
    >
      <div className="flex flex-col gap-1 text-center md:order-2 md:col-start-2 md:row-start-1 md:text-left">
        <h1
          id="payment-waiting-title"
          className="text-lg font-semibold leading-7 text-sop-neutral-gray-200"
        >
          สแกน QR เพื่อชำระเงิน
        </h1>
        <p className="text-base font-medium leading-6 text-sop-neutral-gray-300">
          กรุณาอยู่ในหน้านี้จนกว่าการชำระเงินจะสำเร็จ
        </p>
      </div>

      {remainingMs !== null ? (
        <div className="md:hidden">
          <PaymentCountdown remainingMs={remainingMs} />
        </div>
      ) : null}

      <div className="md:order-1 md:col-start-1 md:row-span-2 md:row-start-1">
        <QrSlipCard
          qrCodeUrl={qrCodeUrl}
          countdown={
            remainingMs !== null ? (
              <div className="hidden px-3 pt-3 md:block">
                <div className="rounded-lg bg-sop-secondary-100 px-3 py-2">
                  <PaymentCountdown remainingMs={remainingMs} accentLabel />
                </div>
              </div>
            ) : undefined
          }
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4 md:order-3 md:col-start-2 md:row-start-2">
        <PaymentDetailsCard
          amountLabel={amountLabel}
          orderNumber={orderNumber}
          orderDateLabel={orderDateLabel}
        />
        <ReferenceIdCard referenceId={referenceId} />
        {actions}
      </div>
    </div>
  );
}
