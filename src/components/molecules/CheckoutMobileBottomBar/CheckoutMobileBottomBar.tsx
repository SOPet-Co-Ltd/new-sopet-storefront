'use client';

import { Button } from '@/components/atoms/Button';
import { useCheckoutSubmit } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type CheckoutMobileBottomBarProps = {
  guestForm: GuestCheckoutFormState | null;
};

export function CheckoutMobileBottomBar({ guestForm }: CheckoutMobileBottomBarProps) {
  const { subtotal } = useCart();
  const { shippingByStoreId, promotionDiscount } = useCheckout();
  const { handleSubmit, isSubmitting, canSubmit } = useCheckoutSubmit(guestForm);
  const selectedShippingCount = Object.keys(shippingByStoreId).length;
  const finalPrice = Math.max(subtotal - promotionDiscount, 0);

  return (
    <div className="block md:hidden" data-testid="checkout-mobile-bottom-bar">
      <div className="mt-14 flex items-center justify-between rounded-tl-sop-20px rounded-tr-sop-20px bg-sop-base-white px-sop-32px py-sop-12px">
        <div className="flex flex-col">
          <label className="sop-body-sm-medium text-sop-neutral-gray-300">ยอดชำระเงิน</label>
          <label className="text-sop-secondary-600" data-testid="checkout-mobile-final-price">
            {formatPrice(finalPrice)}
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
          {selectedShippingCount === 0 ? (
            <span className="mt-1 sop-body-xs-regular text-sop-neutral-gray-400">
              เลือกการจัดส่งก่อน
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
