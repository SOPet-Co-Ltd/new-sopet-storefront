'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/atoms/Button';
import { CheckIcon, SopetCopyIcon } from '@/components/atoms/icons';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import { resolveThaiBankBrand } from '@/lib/banks/thaiBanks';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { BankTransferDetailsDocument } from '@/lib/graphql/generated/graphql';
import { cn } from '@/lib/utils';

type BankTransferWaitingStateProps = {
  amountLabel: string;
  orderNumber?: string | null;
  orderCreatedAt?: string | null;
};

function CopyAccountButton({ accountNumber }: { accountNumber: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [accountNumber]);

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      onClick={() => void onCopy()}
      aria-label="คัดลอกเลขบัญชี"
      iconLeft={
        copied ? (
          <CheckIcon size={{ mobile: 16 }} color="currentColor" />
        ) : (
          <SopetCopyIcon size={{ mobile: 16 }} color="currentColor" />
        )
      }
    >
      {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
    </Button>
  );
}

function BankAvatar({ bankName }: { bankName: string }) {
  const brand = resolveThaiBankBrand(bankName);
  const initial = bankName.trim().charAt(0) || 'ธ';

  if (brand) {
    return (
      <div
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: brand.color }}
        title={brand.name}
      >
        {/* Omise white SVG marks — next/image SVG support is limited; use img. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG bank marks */}
        <img
          src={brand.logoSrc}
          alt=""
          width={32}
          height={32}
          className="size-8 object-contain"
          aria-hidden
        />
        <span className="sr-only">{bankName}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full',
        'bg-sop-primary-200 text-base font-bold text-sop-primary-700',
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function BankTransferWaitingState({
  amountLabel,
  orderNumber,
  orderCreatedAt,
}: BankTransferWaitingStateProps) {
  const { data, loading, error } = useQuery(BankTransferDetailsDocument, {
    fetchPolicy: 'cache-first',
  });

  const details = data?.bankTransferDetails;
  const orderDateLabel = orderCreatedAt ? formatThaiDateTime(orderCreatedAt) : null;

  return (
    <div className="flex w-full flex-col gap-3" data-testid="bank-transfer-waiting">
      <div className="flex flex-col gap-1">
        <h1
          id="payment-bank-transfer-title"
          className="text-lg font-semibold leading-7 text-sop-neutral-gray-200 text-balance"
        >
          คัดลอกบัญชีธนาคาร เพื่อชำระเงิน
        </h1>
        <p className="text-base font-medium leading-6 text-sop-neutral-gray-300">
          โอนเงินตามยอดด้านล่าง แล้วกดยืนยันชำระเงินแล้วเมื่อโอนเสร็จ
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-[20px] bg-sop-neutral-gray-500 px-4 py-10 text-sm text-sop-neutral-gray-300">
          <SpinnerIcon size={{ mobile: 20, desktop: 20 }} />
          กำลังโหลดบัญชีรับโอน...
        </div>
      ) : error || !details ? (
        <p className="rounded-[20px] bg-sop-system-error-100 px-4 py-3 text-sm text-sop-system-error-500">
          ไม่สามารถโหลดข้อมูลบัญชีได้ กรุณาลองใหม่
        </p>
      ) : (
        <div className="flex flex-col gap-4 rounded-[20px] bg-sop-neutral-gray-500 p-4">
          <p className="text-base font-semibold text-[#232323]">ข้อมูลบัญชีรับเงิน</p>
          <div className="flex items-center gap-3">
            <BankAvatar bankName={details.bankName} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-sop-base-black">{details.accountNumber}</p>
              <p className="mt-0.5 text-sm font-medium text-[#232323]">{details.accountName}</p>
            </div>
            <CopyAccountButton accountNumber={details.accountNumber} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 rounded-[20px] bg-sop-neutral-gray-500 p-4">
        <p className="text-lg font-semibold leading-7 text-sop-primary-500">
          รายละเอียดการชำระเงิน
        </p>
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
              <p className="text-right text-sm font-semibold text-sop-base-black">
                {orderDateLabel}
              </p>
            </div>
          ) : null}
        </div>
        <div className="h-px w-full bg-sop-neutral-grayalpha-200" />
        <div className="flex items-center gap-2">
          <p className="flex-1 text-lg font-semibold leading-7 text-sop-neutral-gray-300">
            ยอดชำระเงิน
          </p>
          <p className="flex-1 text-right text-2xl font-semibold leading-9 text-sop-secondary-600">
            {amountLabel}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-sop-system-warning-100 px-4 py-3">
        <p className="text-sm leading-5 text-sop-neutral-gray-300 text-pretty">
          * หากยังไม่ได้ชำระเงิน คำสั่งซื้อจะยังไม่เข้าสู่ขั้นตอนการจัดส่ง ไม่ต้องแนบสลิปการโอน
          ทีมงานจะตรวจสอบรายการชำระโดยอัตโนมัติ
        </p>
      </div>
    </div>
  );
}
