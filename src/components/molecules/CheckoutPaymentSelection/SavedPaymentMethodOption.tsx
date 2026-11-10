'use client';

import type { SavedPaymentMethod } from '@/lib/hooks/usePaymentMethods';
import { isBeamSavedPaymentMethod } from '@/lib/payment/savedPaymentMethod';
import { cn } from '@/lib/utils';
import { CardBrandLogo, formatCardBrandLabel, formatSavedCardExpiry } from './CardBrandLogo';
import { PaymentMethodRadio } from './PaymentMethodRadio';

const NON_BEAM_CARD_COPY = 'บัตรนี้ไม่สามารถใช้ได้';

type SavedPaymentMethodOptionProps = {
  method: SavedPaymentMethod;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export function SavedPaymentMethodOption({
  method,
  selected,
  onSelect,
  disabled = false,
}: SavedPaymentMethodOptionProps) {
  const usable = isBeamSavedPaymentMethod(method);
  const isDisabled = disabled || !usable;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected && usable}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      data-testid={`saved-payment-method-${method.id}`}
      data-psp={method.psp ?? 'unknown'}
      onClick={() => {
        if (!isDisabled) {
          onSelect();
        }
      }}
      className={cn(
        'flex w-full items-center justify-between gap-sop-16px rounded-sop-16px border px-sop-24px py-sop-20px text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sop-neutral-grayalpha-100',
        'disabled:cursor-not-allowed disabled:opacity-60',
        selected && usable
          ? 'border-sop-primary-500 bg-sop-primary-100'
          : 'border-sop-neutral-grayalpha-200 bg-sop-base-white hover:bg-sop-primary-50',
        !usable && 'hover:bg-sop-base-white',
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-sop-12px">
        <span className="pt-[2px]">
          <PaymentMethodRadio checked={selected && usable} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block sop-body-sm-regular text-sop-neutral-gray-200">
            {formatCardBrandLabel(method.brand)} **** {method.lastFour}
          </span>
          <span className="mt-[2px] block sop-body-sm-regular text-sop-neutral-gray-300">
            หมดอายุ {formatSavedCardExpiry(method.expiryMonth, method.expiryYear)}
          </span>
          {!usable ? (
            <span className="mt-[2px] block sop-body-sm-regular text-sop-secondary-500">
              {NON_BEAM_CARD_COPY}
            </span>
          ) : null}
        </span>
      </span>
      <CardBrandLogo
        brand={method.brand}
        className="flex h-8 w-8 shrink-0 items-center justify-center"
      />
    </button>
  );
}
