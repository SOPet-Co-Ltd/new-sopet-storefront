'use client';

import { useMemo } from 'react';
import { Input } from '@/components/atoms/Input';
import { AddressDropdown } from '@/components/molecules/AddressDropdown';
import {
  getDistricts,
  getProvinces,
  getSubdistrictsWithPostal,
  useThaiAddressDataset,
} from '@/lib/thai-address';
import type { GuestCheckoutField } from '@/lib/checkout/guestCheckoutValidation';

type ThaiAddressValues = {
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
};

type ThaiAddressCascadingFieldsProps = {
  values: ThaiAddressValues;
  onChange: (field: keyof ThaiAddressValues, value: string) => void;
  onCascadeReset: (fields: Array<keyof ThaiAddressValues>) => void;
  errors?: Partial<Record<GuestCheckoutField, string>>;
  showErrors?: boolean;
};

export function ThaiAddressCascadingFields({
  values,
  onChange,
  onCascadeReset,
  errors,
  showErrors = false,
}: ThaiAddressCascadingFieldsProps) {
  const { ready } = useThaiAddressDataset();

  const provinceOptions = useMemo(() => (ready ? getProvinces() : []), [ready]);
  const districtOptions = useMemo(
    () => (ready && values.province ? getDistricts(values.province) : []),
    [ready, values.province],
  );
  const subdistrictOptions = useMemo(
    () =>
      ready && values.province && values.district
        ? getSubdistrictsWithPostal(values.province, values.district)
        : [],
    [ready, values.district, values.province],
  );

  const provinceError = showErrors ? errors?.province : undefined;
  const districtError = showErrors ? errors?.district : undefined;
  const subDistrictError = showErrors ? errors?.subDistrict : undefined;
  const postalCodeError = showErrors ? errors?.postalCode : undefined;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-6 md:col-span-2">
        <AddressDropdown
          title="ตำบล/แขวง"
          placeholder="เลือกตำบล/แขวง"
          value={values.subDistrict}
          options={subdistrictOptions}
          disabled={!ready || !values.district}
          error={subDistrictError ? { message: subDistrictError } : undefined}
          onChange={(value) => onChange('subDistrict', value)}
          onSelect={(option) => {
            onChange('subDistrict', option.label);
            onChange('postalCode', String(option.postalCode ?? ''));
          }}
          data-testid="thai-dropdown-subdistrict"
        />

        <AddressDropdown
          title="เขต/อำเภอ"
          placeholder="เลือกเขต/อำเภอ"
          value={values.district}
          options={districtOptions}
          disabled={!ready || !values.province}
          error={districtError ? { message: districtError } : undefined}
          onChange={(value) => {
            onChange('district', value);
            onCascadeReset(['subDistrict', 'postalCode']);
          }}
          data-testid="thai-dropdown-district"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-6 md:col-span-2">
        <AddressDropdown
          title="จังหวัด"
          placeholder="เลือกจังหวัด"
          value={values.province}
          options={provinceOptions}
          disabled={!ready}
          error={provinceError ? { message: provinceError } : undefined}
          onChange={(value) => {
            onChange('province', value);
            onCascadeReset(['district', 'subDistrict', 'postalCode']);
          }}
          data-testid="thai-dropdown-province"
        />

        <Input
          title="รหัสไปรษณีย์"
          hasTitle
          isRequired
          value={values.postalCode}
          placeholder="รหัสไปรษณีย์"
          disabled
          readOnly
          aria-readonly="true"
          state={postalCodeError ? 'error' : 'default'}
          description={postalCodeError}
          data-testid="postal-code-field"
        />
      </div>
    </>
  );
}
