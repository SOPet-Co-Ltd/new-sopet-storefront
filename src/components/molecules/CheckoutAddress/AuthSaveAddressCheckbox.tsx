'use client';

import { Checkbox } from '@/components/atoms/Checkbox';

type AuthSaveAddressCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AuthSaveAddressCheckbox({ checked, onChange }: AuthSaveAddressCheckboxProps) {
  return (
    <label
      className="mt-sop-16px flex cursor-pointer items-start gap-sop-12px"
      data-testid="save-address-checkbox"
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        aria-label="บันทึกไว้ใช้ครั้งถัดไป และตั้งเป็นค่าเริ่มต้น"
      />
      <span className="sop-body-sm-regular text-sop-neutral-gray-300">
        บันทึกไว้ใช้ครั้งถัดไป และตั้งเป็นค่าเริ่มต้น
      </span>
    </label>
  );
}
