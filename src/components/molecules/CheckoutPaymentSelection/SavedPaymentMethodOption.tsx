'use client';

import type { SavedPaymentMethod } from '@/lib/hooks/usePaymentMethods';
import { cn } from '@/lib/utils';
import {
  CardBrandLogo,
  formatCardBrandLabel,
  formatSavedCardExpiry,
} from './CardBrandLogo';
import { PaymentMethodRadio } from './PaymentMethodRadio';

type SavedPaymentMethodOptionProps = {
  method: SavedPaymentMethod;
  selected: boolean;
  onSelect: () => void;
};

export function SavedPaymentMethodOption({
  method,
  selected,
  onSelect,
}: SavedPaymentMethodOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={`saved-payment-method-${method.id}`}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-sop-16px rounded-sop-16px border px-sop-24px py-sop-20px text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sop-neutral-grayalpha-100',
        selected
          ? 'border-sop-primary-500 bg-sop-primary-100'
          : 'border-sop-neutral-grayalpha-200 bg-sop-base-white hover:bg-sop-primary-50',
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-sop-12px">
        <span className="pt-[2px]">
          <PaymentMethodRadio checked={selected} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block sop-body-sm-regular text-sop-neutral-gray-200">
            {formatCardBrandLabel(method.brand)} **** {method.lastFour}
          </span>
          <span className="mt-[2px] block sop-body-sm-regular text-sop-neutral-gray-300">
            หมดอายุ {formatSavedCardExpiry(method.expiryMonth, method.expiryYear)}
          </span>
        </span>
      </span>
      <CardBrandLogo brand={method.brand} className="flex h-8 w-8 shrink-0 items-center justify-center" />
    </button>
  );
}
