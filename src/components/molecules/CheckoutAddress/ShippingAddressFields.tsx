'use client';

import { Input } from '@/components/atoms/Input';
import { ThaiPhoneInput } from '@/components/molecules/ThaiPhoneInput';
import type { GuestCheckoutField, GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { ThaiAddressCascadingFields } from './ThaiAddressCascadingFields';

export type ShippingAddressFieldKey =
  | 'address'
  | 'subDistrict'
  | 'district'
  | 'province'
  | 'postalCode'
  | 'recipientFullName'
  | 'recipientPhone';

export type ShippingAddressFieldsProps = {
  values: Pick<GuestCheckoutFormState, ShippingAddressFieldKey>;
  onChange: (field: ShippingAddressFieldKey, value: string) => void;
  onCascadeReset: (fields: Array<ShippingAddressFieldKey>) => void;
  errors?: Partial<Record<GuestCheckoutField, string>>;
  showErrors?: boolean;
  showHeading?: boolean;
};

export function ShippingAddressFields({
  values,
  onChange,
  onCascadeReset,
  errors,
  showErrors = false,
  showHeading = true,
}: ShippingAddressFieldsProps) {
  const recipientNameError = showErrors ? errors?.recipientName : undefined;
  const recipientPhoneError = showErrors ? errors?.recipientPhone : undefined;
  const addressError = showErrors ? errors?.address : undefined;

  return (
    <section
      role="group"
      aria-labelledby="checkout-shipping-heading"
      data-testid="checkout-shipping-section"
    >
      {showHeading ? (
        <h3
          id="checkout-shipping-heading"
          className="mb-sop-12px sop-body-xs-medium text-sop-neutral-gray-200 lg:sop-body-sm-medium"
        >
          การจัดส่ง
        </h3>
      ) : null}

      <div className="flex flex-col gap-sop-12px">
        <Input
          title="ที่อยู่"
          hasTitle
          isRequired
          placeholder="บ้านเลขที่/ซอย/หมู่/ถนน"
          value={values.address}
          onChange={(event) => onChange('address', event.target.value)}
          state={addressError ? 'error' : 'default'}
          description={addressError}
          data-testid="shipping-address-line1"
        />

        <ThaiAddressCascadingFields
          values={{
            province: values.province,
            district: values.district,
            subDistrict: values.subDistrict ?? '',
            postalCode: values.postalCode,
          }}
          onChange={(field, value) => onChange(field, value)}
          onCascadeReset={(fields) => onCascadeReset(fields)}
          errors={errors}
          showErrors={showErrors}
        />

        <Input
          title="ชื่อ / นามสกุล (ผู้รับสินค้า)"
          hasTitle
          isRequired
          placeholder="ชื่อ / นามสกุล (ผู้รับสินค้า)"
          value={values.recipientFullName}
          onChange={(event) => onChange('recipientFullName', event.target.value)}
          state={recipientNameError ? 'error' : 'default'}
          description={recipientNameError}
          data-testid="shipping-recipient-name"
        />

        <ThaiPhoneInput
          title="เบอร์โทรศัพท์ (ผู้รับสินค้า)"
          hasTitle
          isRequired
          value={values.recipientPhone}
          onValueChange={(value) => onChange('recipientPhone', value)}
          state={recipientPhoneError ? 'error' : 'default'}
          description={recipientPhoneError}
          data-testid="recipient-phone-field"
        />
      </div>
    </section>
  );
}
