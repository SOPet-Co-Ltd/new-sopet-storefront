'use client';

import { useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { PiggyBankIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCheckoutCartSelection } from '@/lib/hooks/useCheckoutCartSelection';
import { useCheckoutTotals } from '@/lib/hooks/useCheckoutTotals';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDiscountPrice(amount: number): string {
  return `- ${formatPrice(amount)}`;
}

type SummaryRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
  labelTitle?: string;
};

function SummaryRow({
  label,
  value,
  valueClassName = 'text-sop-base-black',
  labelTitle,
}: SummaryRowProps) {
  return (
    <div className="flex justify-between gap-sop-8px">
      <label
        className="min-w-0 flex-1 truncate sop-body-sm-regular text-sop-neutral-gray-200 lg:sop-body-md-regular"
        title={labelTitle ?? label}
      >
        {label}
      </label>
      <label className={`shrink-0 sop-body-sm-medium lg:sop-body-md-medium ${valueClassName}`}>
        {value}
      </label>
    </div>
  );
}

type CheckoutSummarySectionProps = {
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
  canSubmit: boolean;
};

export function CheckoutSummarySection({
  onSubmit,
  isSubmitting,
  canSubmit,
}: CheckoutSummarySectionProps) {
  const { isAuthenticated } = useAuth();
  const totals = useCheckoutTotals();
  const { storePromotionsByStoreId } = useCheckout();
  const { selectedItemsByStore } = useCheckoutCartSelection();

  const storeDiscountRows = useMemo(() => {
    const storeNameById = new Map(
      selectedItemsByStore.map((group) => [group.storeId, group.storeName]),
    );

    return Object.entries(totals.storeDiscountByStoreId)
      .filter(([, amount]) => amount > 0)
      .map(([storeId, amount]) => {
        const promotion = storePromotionsByStoreId[storeId];
        const storeName = storeNameById.get(storeId);
        const code = promotion?.code ?? '';
        const label = storeName ? `${storeName} (${code})` : code;
        const labelTitle = storeName
          ? `ส่วนลดร้านค้า ${storeName} · ${code}`
          : `ส่วนลดร้านค้า · ${code}`;

        return { storeId, label, labelTitle, amount };
      });
  }, [selectedItemsByStore, storePromotionsByStoreId, totals.storeDiscountByStoreId]);

  return (
    <div className="w-full rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:px-sop-24px lg:py-sop-20px">
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
          label={`ยอดรวมสินค้า (${totals.itemCount} ชิ้น)`}
          value={formatPrice(totals.subtotal)}
        />
        {storeDiscountRows.map((row) => (
          <SummaryRow
            key={row.storeId}
            label={row.label}
            labelTitle={row.labelTitle}
            value={formatDiscountPrice(row.amount)}
            valueClassName="text-sop-secondary-600"
          />
        ))}
        {totals.platformPromotionDiscount > 0 ? (
          <SummaryRow
            label="ส่วนลดแพลตฟอร์ม"
            value={formatDiscountPrice(totals.platformPromotionDiscount)}
            valueClassName="text-sop-secondary-600"
          />
        ) : null}
        <SummaryRow
          label="ค่าจัดส่ง"
          value={
            totals.isShippingComplete
              ? formatPrice(totals.shippingFeeTotal)
              : totals.shippingFeeTotal > 0
                ? formatPrice(totals.shippingFeeTotal)
                : 'คำนวณตอนยืนยัน'
          }
        />
      </div>

      <div className="hidden border-t border-sop-neutral-grayalpha-200 pt-sop-16px text-sop-neutral-grayalpha-200 md:block">
        <div className="flex justify-between">
          <label className="sop-body-lg-medium text-sop-neutral-gray-300">ยอดชำระเงิน</label>
          <label
            className="sop-headline-md-medium text-sop-secondary-600"
            data-testid="checkout-final-price"
          >
            {formatPrice(totals.finalPrice)}
          </label>
        </div>
      </div>

      {totals.savingsTotal > 0 ? (
        <div className="mt-sop-16px hidden items-center gap-sop-8px rounded-sop-8 bg-sop-additionalgreen-200 px-sop-16px py-sop-8px md:flex">
          <PiggyBankIcon size={{ mobile: 24, desktop: 24 }} color="#4E7762" />
          <p className="sop-body-xs-medium text-sop-additionalgreen-700">
            คุณประหยัดไป {formatPrice(totals.savingsTotal)} จากออเดอร์นี้
          </p>
        </div>
      ) : null}

      <Button
        className="mt-sop-16px hidden w-full md:block"
        variant="primary"
        size="xl"
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={() => {
          void onSubmit();
        }}
        data-testid="checkout-submit-desktop"
      >
        {isSubmitting ? 'กำลังดำเนินการ...' : `ชำระเงิน ${formatPrice(totals.finalPrice)}`}
      </Button>
    </div>
  );
}
