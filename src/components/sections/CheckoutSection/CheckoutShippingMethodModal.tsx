'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { TruckIcon } from '@/components/atoms/icons';
import { Modal } from '@/components/atoms/Modal';
import type { ShippingOption } from '@/lib/hooks/useShippingOptions';
import { cn } from '@/lib/utils';
import { formatCheckoutPrice } from './checkoutOrderItemUtils';

type CheckoutShippingMethodModalProps = {
  isOpen: boolean;
  storeName: string;
  options: ShippingOption[];
  selectedOptionId: string | null;
  onClose: () => void;
  onConfirm: (optionId: string) => void;
};

type ShippingMethodRadioProps = {
  checked: boolean;
};

function ShippingMethodRadio({ checked }: ShippingMethodRadioProps) {
  return (
    <span
      className={cn(
        'flex h-sop-20px w-sop-20px shrink-0 items-center justify-center rounded-full border bg-sop-base-white',
        checked ? 'border-sop-primary-500' : 'border-sop-neutral-grayalpha-200',
      )}
      aria-hidden
    >
      {checked ? <span className="h-[10px] w-[10px] rounded-full bg-sop-primary-500" /> : null}
    </span>
  );
}

function formatShippingOptionDescription(description: string | null | undefined): string | null {
  const trimmed = description?.trim();
  if (!trimmed) return null;
  return trimmed;
}

type ShippingMethodOptionCardProps = {
  option: ShippingOption;
  selected: boolean;
  onSelect: () => void;
};

function ShippingMethodOptionCard({ option, selected, onSelect }: ShippingMethodOptionCardProps) {
  const description = formatShippingOptionDescription(option.description);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={`checkout-shipping-modal-option-${option.id}`}
      onClick={onSelect}
      className={cn(
        'flex h-[74px] w-full items-center justify-between gap-sop-16px rounded-sop-12px border border-sop-neutral-grayalpha-300 bg-sop-base-white p-sop-16px text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sop-neutral-grayalpha-100',
        'hover:bg-sop-primary-50',
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-sop-16px">
        <ShippingMethodRadio checked={selected} />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <TruckIcon size={{ mobile: 40 }} color="#6E76EE" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block sop-body-sm-medium text-sop-neutral-gray-200">{option.name}</span>
          {description ? (
            <span className="mt-sop-paragraph-spacing-XS block sop-body-xs-regular text-sop-neutral-gray-300">
              {description}
            </span>
          ) : null}
        </span>
      </span>
      <span className="shrink-0 sop-headline-sm-medium text-sop-additionalblue-500">
        {formatCheckoutPrice(option.price)}
      </span>
    </button>
  );
}

export function CheckoutShippingMethodModal({
  isOpen,
  storeName,
  options,
  selectedOptionId,
  onClose,
  onConfirm,
}: CheckoutShippingMethodModalProps) {
  const [pendingOptionId, setPendingOptionId] = useState(selectedOptionId ?? options[0]?.id ?? '');

  useEffect(() => {
    if (!isOpen) return;
    setPendingOptionId(selectedOptionId ?? options[0]?.id ?? '');
  }, [isOpen, options, selectedOptionId]);

  if (!isOpen) return null;

  return (
    <Modal
      header={
        <div>
          <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">ตัวเลือกการจัดส่ง</h2>
          <p className="mt-sop-4px sop-body-sm-regular text-sop-neutral-gray-400">{storeName}</p>
        </div>
      }
      footer={
        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <Button variant="filled" fill size="lg" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            fill
            size="lg"
            disabled={!pendingOptionId}
            onClick={() => {
              if (pendingOptionId) {
                onConfirm(pendingOptionId);
                onClose();
              }
            }}
          >
            ยืนยัน
          </Button>
        </div>
      }
      onClose={onClose}
      contentClassName="pb-sop-16px"
      data-testid="checkout-shipping-modal"
    >
      <div
        className="flex flex-col gap-sop-12px"
        role="radiogroup"
        aria-label={`ตัวเลือกการจัดส่ง ${storeName}`}
      >
        {options.map((option) => (
          <ShippingMethodOptionCard
            key={option.id}
            option={option}
            selected={pendingOptionId === option.id}
            onSelect={() => setPendingOptionId(option.id)}
          />
        ))}
      </div>
    </Modal>
  );
}
