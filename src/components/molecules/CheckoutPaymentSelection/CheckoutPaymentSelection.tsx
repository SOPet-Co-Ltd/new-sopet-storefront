'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QrCodeIcon, SubtractIcon, WalletIcon } from '@/components/atoms/icons';
import { useCheckout, type PaymentMethod } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';
import { CardPaymentForm } from './CardPaymentForm';
import {
  createCheckoutCardPaymentBridge,
  EMPTY_CHECKOUT_CARD_FORM,
  registerCheckoutCardPaymentBridge,
  type CheckoutCardFormState,
} from './checkoutCardPaymentBridge';

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
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [cardFormError, setCardFormError] = useState<string | null>(null);
  const cardFormRef = useRef(cardForm);

  useLayoutEffect(() => {
    cardFormRef.current = cardForm;
  }, [cardForm]);

  const clearCardForm = useCallback(() => {
    setCardForm(EMPTY_CHECKOUT_CARD_FORM);
    setCardFormError(null);
  }, []);

  useEffect(() => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => cardFormRef.current,
        clearCardForm,
      }),
    );

    return () => {
      registerCheckoutCardPaymentBridge(null);
    };
  }, [clearCardForm]);

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
      setCardFormError(null);
      if (paymentMethod === 'card' && method !== 'card') {
        clearCardForm();
      }
      setPaymentMethod(method);
    },
    [clearCardForm, paymentMethod, setPaymentMethod],
  );

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
          <div key={option.value} className="flex flex-col gap-sop-16px">
            <PaymentSelectBox
              value={option.value}
              selectedValue={paymentMethod}
              onChange={handlePaymentMethodChange}
              rightIcon={option.icon}
            >
              {option.label}
            </PaymentSelectBox>

            {option.value === 'card' && paymentMethod === 'card' ? (
              <CardPaymentForm
                value={cardForm}
                onChange={(next) => {
                  setCardForm(next);
                  if (cardFormError) {
                    setCardFormError(null);
                  }
                }}
                error={cardFormError}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
