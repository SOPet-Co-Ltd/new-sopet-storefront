'use client';

import { Button } from '@/components/atoms/Button';
import { useCheckoutTotals } from '@/lib/hooks/useCheckoutTotals';
import { useCheckoutSubmit, type AddressSubmitContext } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

type CheckoutMobileBottomBarProps = {
  guestForm: GuestCheckoutFormState | null;
  addressSubmitContext?: AddressSubmitContext;
};

export function CheckoutMobileBottomBar({
  guestForm,
  addressSubmitContext,
}: CheckoutMobileBottomBarProps) {
  const totals = useCheckoutTotals();
  const { handleSubmit, isSubmitting, canSubmit } = useCheckoutSubmit(guestForm, {
    addressSubmitContext,
  });

  return (
    <div className="block md:hidden" data-testid="checkout-mobile-bottom-bar">
      <div className="mt-14 flex items-center justify-between rounded-tl-sop-20px rounded-tr-sop-20px bg-sop-base-white px-sop-32px py-sop-12px">
        <div className="flex flex-col">
          <label className="sop-body-sm-medium text-sop-neutral-gray-300">ยอดชำระเงิน</label>
          <label className="text-sop-secondary-600" data-testid="checkout-mobile-final-price">
            {formatPrice(totals.finalPrice)}
          </label>
        </div>
        <div className="flex flex-col items-end">
          <Button
            className="w-fit"
            variant="primary"
            size="lg"
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => {
              void handleSubmit();
            }}
            data-testid="checkout-submit-mobile"
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
          </Button>
          {!totals.isShippingComplete ? (
            <span className="mt-1 sop-body-xs-regular text-sop-neutral-gray-400">
              เลือกการจัดส่งก่อน
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
