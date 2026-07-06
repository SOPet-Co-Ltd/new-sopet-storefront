'use client';

import { Input } from '@/components/atoms/Input';
import type { CheckoutCardFormState } from './checkoutCardPaymentBridge';
import {
  formatCardName,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  getCvvLength,
} from './paymentFormat';

type CardPaymentFormProps = {
  value: CheckoutCardFormState;
  onChange: (next: CheckoutCardFormState) => void;
  error?: string | null;
};

export function CardPaymentForm({ value, onChange, error }: CardPaymentFormProps) {
  const updateField = <K extends keyof CheckoutCardFormState>(
    field: K,
    fieldValue: CheckoutCardFormState[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div data-testid="checkout-card-payment-form">
      <div className="my-sop-20px border-t border-sop-neutral-grayalpha-200" />

      <p className="sop-body-md-regular text-sop-neutral-gray-300">ข้อมูลบัตรของคุณ</p>

      <div className="mt-sop-20px grid grid-cols-1 gap-4">
        <Input
          isRequire
          title="หมายเลขบัตร"
          size="sm"
          variant="bordered"
          placeholder="0000-1111-0000-1111"
          inputMode="numeric"
          autoComplete="cc-number"
          data-testid="card-number-input"
          value={value.cardNumber}
          onChange={(event) => {
            const cardNumber = formatCardNumber(event.target.value);
            updateField('cardNumber', cardNumber);
            updateField('cvv', formatCvv(value.cvv, cardNumber));
          }}
        />

        <Input
          isRequire
          title="ชื่อบนบัตร"
          size="sm"
          variant="bordered"
          placeholder="จันจิรา เอสโอเพ็ท"
          autoComplete="cc-name"
          data-testid="card-name-input"
          value={value.cardName}
          onChange={(event) => updateField('cardName', formatCardName(event.target.value))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            isRequire
            title="วันหมดอายุ"
            size="sm"
            variant="bordered"
            placeholder="MM/YY"
            inputMode="numeric"
            autoComplete="cc-exp"
            data-testid="card-expiry-input"
            value={value.expiry}
            onChange={(event) => updateField('expiry', formatExpiry(event.target.value))}
          />

          <Input
            isRequire
            title="รหัส CVV"
            size="sm"
            variant="bordered"
            placeholder="***"
            inputMode="numeric"
            autoComplete="cc-csc"
            data-testid="card-cvv-input"
            value={value.cvv}
            maxLength={getCvvLength(value.cardNumber)}
            onChange={(event) =>
              updateField('cvv', formatCvv(event.target.value, value.cardNumber))
            }
          />
        </div>
      </div>

      {error ? (
        <p className="sop-body-xs-regular mt-sop-12px text-sop-system-error-400">{error}</p>
      ) : null}
    </div>
  );
}
