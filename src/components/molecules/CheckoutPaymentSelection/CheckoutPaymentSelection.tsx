'use client';

import { QrCodeIcon, SubtractIcon, WalletIcon } from '@/components/atoms/icons';
import { useCheckout, type PaymentMethod } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';

type PaymentOption = {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: 'promptpay',
    label: 'QR Code / PromptPay',
    icon: <QrCodeIcon color="#9C6ADE" />,
  },
  {
    value: 'card',
    label: 'บัตรเครดิต/บัตรเดบิต',
    icon: <SubtractIcon color="#9C6ADE" />,
  },
  {
    value: 'cod',
    label: 'เก็บเงินปลายทาง',
    icon: <WalletIcon size={{ mobile: 20 }} color="#9C6ADE" />,
  },
];

type PaymentSelectBoxProps = {
  value: PaymentMethod;
  selectedValue: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  rightIcon: React.ReactNode;
  children: React.ReactNode;
};

function PaymentSelectBox({
  value,
  selectedValue,
  onChange,
  rightIcon,
  children,
}: PaymentSelectBoxProps) {
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      data-testid={`payment-method-${value}`}
      onClick={() => onChange(value)}
      className={cn(
        'flex w-full items-center justify-between rounded-sop-12px border px-sop-16px py-sop-14px text-left transition-colors',
        isSelected
          ? 'border-sop-primary-500 bg-sop-primary-100'
          : 'border-sop-neutral-grayalpha-300 bg-sop-base-white hover:bg-sop-primary-50',
      )}
    >
      <span className="sop-body-sm-regular text-sop-neutral-gray-300 lg:sop-body-md-regular">
        {children}
      </span>
      <span className="flex shrink-0 items-center">{rightIcon}</span>
    </button>
  );
}

export function CheckoutPaymentSelection() {
  const { paymentMethod, setPaymentMethod } = useCheckout();

  return (
    <div
      className="mb-sop-16px min-h-60 w-full rounded-sop-20 bg-sop-base-white p-sop-24px"
      data-testid="checkout-payment-selection"
    >
      <div className="flex items-center gap-sop-8px">
        <WalletIcon size={{ mobile: 24 }} color="#884ECF" />
        <h2 className="sop-body-lg-medium text-sop-primary-500">วิธีการชำระเงิน</h2>
      </div>

      <div className="mt-sop-16px flex flex-col gap-sop-16px">
        {PAYMENT_OPTIONS.map((option) => (
          <PaymentSelectBox
            key={option.value}
            value={option.value}
            selectedValue={paymentMethod}
            onChange={setPaymentMethod}
            rightIcon={option.icon}
          >
            {option.label}
          </PaymentSelectBox>
        ))}
      </div>
    </div>
  );
}
