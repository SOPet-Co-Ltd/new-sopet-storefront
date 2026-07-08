'use client';

import { Checkbox } from '@/components/atoms/Checkbox';
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
  saveCardChecked?: boolean;
  onSaveCardChange?: (checked: boolean) => void;
  showSaveCardCheckbox?: boolean;
};

export function CardPaymentForm({
  value,
  onChange,
  error,
  saveCardChecked = false,
  onSaveCardChange,
  showSaveCardCheckbox = false,
}: CardPaymentFormProps) {
  const updateField = <K extends keyof CheckoutCardFormState>(
    field: K,
    fieldValue: CheckoutCardFormState[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div data-testid="checkout-card-payment-form" className="flex flex-col gap-sop-12px">
      <div className="flex flex-col gap-sop-16px">
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
            onChange({
              ...value,
              cardNumber,
              cvv: formatCvv(value.cvv, cardNumber),
            });
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
      </div>

      <div className="flex flex-col gap-sop-16px">
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
          title="รหัส CCV"
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

      {showSaveCardCheckbox ? (
        <label className="flex items-center gap-sop-12px">
          <Checkbox
            checked={saveCardChecked}
            onChange={(checked) => onSaveCardChange?.(checked)}
            aria-label="บันทึกไว้ใช้ครั้งถัดไป และตั้งเป็นค่าเริ่มต้น"
          />
          <span className="sop-body-sm-regular text-sop-neutral-gray-200">
            บันทึกไว้ใช้ครั้งถัดไป และตั้งเป็นค่าเริ่มต้น
          </span>
        </label>
      ) : null}

      {error ? (
        <p className="sop-body-xs-regular text-sop-system-error-400">{error}</p>
      ) : null}
    </div>
  );
}
