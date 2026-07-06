'use client';

import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { useCheckoutSubmit } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type SummaryRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function SummaryRow({ label, value, valueClassName = 'text-sop-base-black' }: SummaryRowProps) {
  return (
    <div className="flex justify-between">
      <label className="sop-body-sm-regular text-sop-neutral-gray-200 lg:sop-body-md-regular">
        {label}
      </label>
      <label className={`sop-body-sm-medium lg:sop-body-md-medium ${valueClassName}`}>
        {value}
      </label>
    </div>
  );
}

type CheckoutSummarySectionProps = {
  guestForm: GuestCheckoutFormState | null;
};

export function CheckoutSummarySection({ guestForm }: CheckoutSummarySectionProps) {
  const { isAuthenticated } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { shippingByStoreId, promotionDiscount } = useCheckout();
  const { handleSubmit, isSubmitting, canSubmit } = useCheckoutSubmit(guestForm);

  const selectedShippingCount = Object.keys(shippingByStoreId).length;
  const displayShippingFee = selectedShippingCount > 0 ? 0 : 0;
  const finalPrice = Math.max(subtotal + displayShippingFee - promotionDiscount, 0);

  return (
    <div className="mt-sop-12px w-full rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:px-sop-24px lg:py-sop-20px">
      {!isAuthenticated ? (
        <div className="mb-sop-16px flex w-full items-center justify-center rounded-sop-12 bg-sop-additionalblue-100 px-sop-16px py-sop-12px sop-body-sm-medium text-sop-additionalblue-500">
          บิลนี้ถูกสั่งซื้อผ่าน Guest Mode
        </div>
      ) : null}

      <label className="sop-body-md-medium text-sop-primary-500 lg:sop-body-lg-medium">
        สรุปคำสั่งซื้อ
      </label>

      <div className="mb-4 mt-sop-16px space-y-sop-8px">
        <SummaryRow
          label={`ยอดรวมสินค้า (${itemCount} ชิ้น)`}
          value={formatPrice(subtotal)}
        />
        {promotionDiscount > 0 ? (
          <SummaryRow
            label="ส่วนลด"
            value={`-${formatPrice(promotionDiscount)}`}
            valueClassName="text-sop-system-success-500"
          />
        ) : null}
        <SummaryRow
          label="ค่าจัดส่ง"
          value={selectedShippingCount > 0 ? 'คำนวณตอนยืนยัน' : formatPrice(0)}
        />
      </div>

      <div className="hidden border-t border-sop-neutral-grayalpha-200 pt-sop-16px text-sop-neutral-grayalpha-200 md:block">
        <div className="flex justify-between">
          <label className="sop-body-lg-medium text-sop-neutral-gray-300">ยอดชำระเงิน</label>
          <label className="sop-headline-md-medium text-sop-secondary-600" data-testid="checkout-final-price">
            {formatPrice(finalPrice)}
          </label>
        </div>
      </div>

      <Button
        className="mt-sop-16px hidden w-full md:block"
        variant="primary"
        size="lg"
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={() => {
          void handleSubmit();
        }}
        data-testid="checkout-submit-desktop"
      >
        {isSubmitting ? 'กำลังดำเนินการ...' : `ชำระเงิน ${formatPrice(finalPrice)}`}
      </Button>
    </div>
  );
}
