'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/atoms/Modal';
import { SubtractIcon } from '@/components/atoms/icons';
import { formatSavedCardCvv, getSavedCardCvvLength } from './SavedCardCvvField';
import { isValidSavedCardCvv } from './checkoutCardPaymentBridge';

export type SavedCardCvvModalProps = {
  open: boolean;
  brand: string;
  lastFour: string;
  amountLabel: string;
  onCancel: () => void;
  onConfirm: (cvv: string) => void;
};

function formatAmountLabel(amountLabel: string): string {
  const trimmed = amountLabel.trim();
  if (!trimmed) {
    return '฿0';
  }
  return trimmed.startsWith('฿') ? trimmed : `฿${trimmed}`;
}

export function SavedCardCvvModal({
  open,
  brand,
  lastFour,
  amountLabel,
  onCancel,
  onConfirm,
}: SavedCardCvvModalProps) {
  const [cvv, setCvv] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setCvv('');
    }
  }
  const length = getSavedCardCvvLength(brand);
  const canConfirm = useMemo(
    () => isValidSavedCardCvv(cvv) && cvv.length === length,
    [cvv, length],
  );

  if (!open) {
    return null;
  }

  const brandRaw = brand.trim();
  const brandLabel = brandRaw
    ? brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase()
    : 'บัตร';
  const amount = formatAmountLabel(amountLabel);

  return (
    <Modal
      width={411}
      onClose={onCancel}
      insideCloseButton={false}
      contentClassName="px-0"
      data-testid="saved-card-cvv-modal"
      aria-labelledby="saved-card-cvv-modal-title"
    >
      <div className="flex w-full flex-col items-center gap-sop-20px px-sop-32px py-sop-32px">
        <div className="flex size-20 items-center justify-center rounded-full bg-sop-primary-100 p-1">
          <SubtractIcon size={{ mobile: 40 }} color="#9C6ADE" />
        </div>

        <div className="flex w-full flex-col items-center gap-1 text-center">
          <h2
            id="saved-card-cvv-modal-title"
            className="sop-body-lg-medium text-sop-neutral-gray-200"
          >
            ยืนยันรหัส CVV
          </h2>
          <p className="sop-body-md-regular text-sop-neutral-gray-300">
            กรอกรหัส {length} หลักด้านหลังบัตร {brandLabel} •••• {lastFour}
          </p>
          <p className="sop-body-md-regular text-sop-neutral-gray-300">เพื่อชำระเงิน {amount}</p>
        </div>

        <div className="w-full max-w-[347px]">
          <Input
            isRequire
            title="รหัส CVV"
            size="md"
            variant="bordered"
            type="password"
            placeholder={length === 4 ? '****' : '***'}
            inputMode="numeric"
            autoComplete="cc-csc"
            data-testid="saved-card-cvv-modal-input"
            description={length === 4 ? 'ตัวเลข 4 หลักด้านหน้าบัตร' : 'ตัวเลข 3 หลักด้านหลังบัตร'}
            value={cvv}
            maxLength={length}
            onChange={(event) => setCvv(formatSavedCardCvv(event.target.value, brand))}
          />
        </div>

        <div className="flex w-full max-w-[347px] gap-sop-12px">
          <Button
            type="button"
            variant="neutral"
            size="md"
            rounded="full"
            className="h-11 flex-1"
            data-testid="saved-card-cvv-modal-cancel"
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            fill
            size="md"
            rounded="full"
            className="h-11 flex-1"
            disabled={!canConfirm}
            data-testid="saved-card-cvv-modal-confirm"
            onClick={() => {
              if (!canConfirm) {
                return;
              }
              const next = cvv.trim();
              setCvv('');
              onConfirm(next);
            }}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </Modal>
  );
}
