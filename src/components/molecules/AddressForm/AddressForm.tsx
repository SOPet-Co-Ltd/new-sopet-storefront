'use client';

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { ThaiPhoneInput } from '@/components/molecules/ThaiPhoneInput';
import { ThaiAddressCascadingFields } from '@/components/molecules/CheckoutAddress/ThaiAddressCascadingFields';
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

type AddressFormSectionProps = {
  title: string;
  headingId: string;
  children: ReactNode;
};

function AddressFormSection({ title, headingId, children }: AddressFormSectionProps) {
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 sop-body-sm-medium text-sop-neutral-gray-200">
        {title}
      </h2>
      <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6">
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}

type AddressFormProps = {
  values: AddressFormValues;
  onChange: Dispatch<SetStateAction<AddressFormValues>>;
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
  const patchValues = (patch: Partial<AddressFormValues>) => {
    onChange((current) => ({ ...current, ...patch }));
  };

  const update = <K extends keyof AddressFormValues>(field: K, value: AddressFormValues[K]) => {
    patchValues({ [field]: value } as Pick<AddressFormValues, K>);
  };

  const handleThaiAddressChange = (
    field: 'province' | 'district' | 'subDistrict' | 'postalCode',
    value: string,
  ) => {
    switch (field) {
      case 'province':
        patchValues({ province: value, amphoe: '', tumbon: '', postalCode: '' });
        break;
      case 'district':
        patchValues({ amphoe: value, tumbon: '', postalCode: '' });
        break;
      case 'subDistrict':
        patchValues({ tumbon: value });
        break;
      case 'postalCode':
        patchValues({ postalCode: value });
        break;
    }
  };

  const handleThaiAddressCascadeReset = (
    fields: Array<'province' | 'district' | 'subDistrict' | 'postalCode'>,
  ) => {
    const patch: Partial<AddressFormValues> = {};

    if (fields.includes('district')) {
      patch.amphoe = '';
    }
    if (fields.includes('subDistrict')) {
      patch.tumbon = '';
    }
    if (fields.includes('postalCode')) {
      patch.postalCode = '';
    }

    if (Object.keys(patch).length > 0) {
      patchValues(patch);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AddressFormSection title="ข้อมูลที่อยู่" headingId="address-label-heading">
        <Input
          title="ชื่อที่อยู่"
          placeholder="เช่น บ้าน, ที่ทำงาน"
          value={values.label}
          onChange={(e) => update('label', e.target.value)}
          variant="bordered"
          isRequire
        />
      </AddressFormSection>

      <AddressFormSection title="ข้อมูลผู้รับ" headingId="address-recipient-heading">
        <Input
          title="ชื่อ-นามสกุลผู้รับ"
          placeholder="กรอกชื่อ-นามสกุลผู้รับ"
          value={values.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          variant="bordered"
          isRequire
        />
        <ThaiPhoneInput
          title="เบอร์โทรศัพท์"
          hasTitle
          isRequired
          value={values.phone}
          onValueChange={(value) => update('phone', value)}
          variant="bordered"
        />
      </AddressFormSection>

      <AddressFormSection title="รายละเอียดที่อยู่" headingId="address-details-heading">
        <Input
          title="ที่อยู่ (บ้านเลขที่ / หมู่ / ซอย / ถนน)"
          placeholder="กรอกที่อยู่"
          value={values.addressLine1}
          onChange={(e) => update('addressLine1', e.target.value)}
          variant="bordered"
          isRequire
        />
        <Input
          title="ที่อยู่เพิ่มเติม (อาคาร / ชั้น / ห้อง)"
          placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)"
          value={values.addressLine2}
          onChange={(e) => update('addressLine2', e.target.value)}
          variant="bordered"
        />
        <ThaiAddressCascadingFields
          values={{
            province: values.province,
            district: values.amphoe,
            subDistrict: values.tumbon,
            postalCode: values.postalCode,
          }}
          onChange={handleThaiAddressChange}
          onCascadeReset={handleThaiAddressCascadeReset}
          inputVariant="bordered"
        />
      </AddressFormSection>

      <section aria-labelledby="address-default-heading">
        <h2 id="address-default-heading" className="sr-only">
          ตั้งค่าที่อยู่หลัก
        </h2>
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6">
          <label className="flex cursor-pointer items-center gap-3 sop-body-sm-regular text-sop-neutral-gray-200">
            <input
              type="checkbox"
              checked={values.isDefault}
              onChange={(e) => update('isDefault', e.target.checked)}
              className="h-4 w-4 rounded border-sop-neutral-grayalpha-200 accent-sop-primary-500"
            />
            ตั้งเป็นที่อยู่หลัก
          </label>
        </div>
      </section>

      {error ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
