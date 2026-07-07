'use client';

import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import type { CreateAddressInput } from '@/lib/graphql/generated/graphql';
import type { SavedAddress } from '@/lib/hooks/useAddresses';

export type AddressFormValues = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  tumbon: string;
  amphoe: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  tumbon: '',
  amphoe: '',
  province: '',
  postalCode: '',
  isDefault: false,
};

export function addressToFormValues(address: SavedAddress): AddressFormValues {
  return {
    label: address.label ?? '',
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    tumbon: address.tumbon ?? '',
    amphoe: address.amphoe,
    province: address.province,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

export function formValuesToCreateInput(values: AddressFormValues): CreateAddressInput {
  return {
    label: values.label.trim(),
    recipientName: values.fullName.trim(),
    recipientPhone: values.phone.trim(),
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2.trim() || undefined,
    tumbon: values.tumbon.trim() || undefined,
    amphoe: values.amphoe.trim(),
    province: values.province.trim(),
    postalCode: values.postalCode.trim(),
    isDefault: values.isDefault,
  };
}

type AddressFormProps = {
  values: AddressFormValues;
  onChange: (values: AddressFormValues) => void;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
};

export function AddressForm({
  values,
  onChange,
  onSubmit,
  submitLabel = 'บันทึกที่อยู่',
  loading = false,
  error,
}: AddressFormProps) {
  const update = <K extends keyof AddressFormValues>(field: K, value: AddressFormValues[K]) => {
    onChange({ ...values, [field]: value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        title="ชื่อที่อยู่"
        placeholder="เช่น บ้าน, ที่ทำงาน"
        value={values.label}
        onChange={(e) => update('label', e.target.value)}
        isRequire
      />
      <Input
        title="ชื่อ-นามสกุลผู้รับ"
        value={values.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        isRequire
      />
      <Input
        title="เบอร์โทรศัพท์"
        type="tel"
        inputMode="tel"
        value={values.phone}
        onChange={(e) => update('phone', e.target.value)}
        isRequire
      />
      <Input
        title="ที่อยู่ (บ้านเลขที่ / หมู่ / ซอย / ถนน)"
        value={values.addressLine1}
        onChange={(e) => update('addressLine1', e.target.value)}
        isRequire
      />
      <Input
        title="ที่อยู่เพิ่มเติม (อาคาร / ชั้น / ห้อง)"
        value={values.addressLine2}
        onChange={(e) => update('addressLine2', e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          title="ตำบล/แขวง"
          value={values.tumbon}
          onChange={(e) => update('tumbon', e.target.value)}
        />
        <Input
          title="อำเภอ/เขต"
          value={values.amphoe}
          onChange={(e) => update('amphoe', e.target.value)}
          isRequire
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          title="จังหวัด"
          value={values.province}
          onChange={(e) => update('province', e.target.value)}
          isRequire
        />
        <Input
          title="รหัสไปรษณีย์"
          inputMode="numeric"
          value={values.postalCode}
          onChange={(e) => update('postalCode', e.target.value)}
          isRequire
        />
      </div>

      <label className="flex items-center gap-2 sop-body-sm-regular text-sop-neutral-gray-300">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => update('isDefault', e.target.checked)}
          className="h-4 w-4 rounded border-sop-neutral-grayalpha-200 accent-sop-primary-500"
        />
        ตั้งเป็นที่อยู่หลัก
      </label>

      {error ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {error}
        </p>
      ) : null}

      <Button type="submit" fill loading={loading} disabled={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
