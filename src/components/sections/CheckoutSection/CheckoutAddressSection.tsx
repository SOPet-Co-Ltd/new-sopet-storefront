'use client';

import { useEffect } from 'react';
import { Input } from '@/components/atoms/Input';
import { MapPinIcon } from '@/components/atoms/icons';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useAuth } from '@/lib/hooks/useAuth';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';

type CheckoutAddressSectionProps = {
  guestForm: GuestCheckoutFormState;
  onGuestFormChange: (field: keyof GuestCheckoutFormState, value: string) => void;
};

function GuestAddressFields({
  guestForm,
  onGuestFormChange,
}: CheckoutAddressSectionProps) {
  const fields: Array<{
    key: keyof GuestCheckoutFormState;
    label: string;
    placeholder: string;
    required?: boolean;
  }> = [
    { key: 'contactPhone', label: 'เบอร์โทรศัพท์', placeholder: 'กรอกเบอร์โทรศัพท์ของคุณ', required: true },
    { key: 'recipientFullName', label: 'ชื่อ / นามสกุล (ผู้รับสินค้า)', placeholder: 'กรอกชื่อผู้รับสินค้า', required: true },
    { key: 'recipientPhone', label: 'เบอร์โทรศัพท์ (ผู้รับสินค้า)', placeholder: 'กรอกเบอร์โทรผู้รับ', required: true },
    { key: 'address', label: 'ที่อยู่', placeholder: 'บ้านเลขที่ ถนน', required: true },
    { key: 'district', label: 'เขต/อำเภอ', placeholder: 'เลือกเขต/อำเภอ', required: true },
    { key: 'province', label: 'จังหวัด', placeholder: 'เลือกจังหวัด', required: true },
    { key: 'postalCode', label: 'รหัสไปรษณีย์', placeholder: 'รหัสไปรษณีย์', required: true },
    { key: 'email', label: 'อีเมล (ไม่บังคับ)', placeholder: 'example@email.com' },
  ];

  return (
    <div className="grid gap-sop-12px md:grid-cols-2">
      {fields.map((field) => (
        <Input
          key={field.key}
          title={field.label}
          hasTitle
          isRequired={field.required}
          placeholder={field.placeholder}
          value={guestForm[field.key] ?? ''}
          onChange={(event) => onGuestFormChange(field.key, event.target.value)}
          className={field.key === 'address' ? 'md:col-span-2' : undefined}
        />
      ))}
    </div>
  );
}

function SavedAddressList() {
  const { addresses, loading } = useAddresses();
  const { selectedAddressId, setAddress } = useCheckout();

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, setAddress]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3" data-testid="address-loading">
        <div className="h-16 rounded-sop-12px bg-sop-neutral-gray-500" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <p className="sop-body-sm-regular text-sop-neutral-gray-400" data-testid="address-empty">
        เพิ่มที่อยู่
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sop-12px" data-testid="address-list">
      {addresses.map((address) => {
        const isSelected = selectedAddressId === address.id;

        return (
          <button
            key={address.id}
            type="button"
            data-testid={`address-option-${address.id}`}
            onClick={() => setAddress(address.id)}
            className={cn(
              'rounded-sop-12px border px-sop-16px py-sop-12px text-left transition-colors',
              isSelected
                ? 'border-sop-primary-500 bg-sop-primary-100'
                : 'border-sop-neutral-grayalpha-300 bg-sop-base-white',
            )}
          >
            <p className="sop-body-sm-medium text-sop-neutral-gray-300">{address.fullName}</p>
            <p className="sop-body-xs-regular text-sop-neutral-gray-400">
              {address.addressLine1} {address.amphoe} {address.province} {address.postalCode}
            </p>
            <p className="sop-body-xs-regular text-sop-neutral-gray-400">{address.phone}</p>
          </button>
        );
      })}
    </div>
  );
}

export function CheckoutAddressSection({
  guestForm,
  onGuestFormChange,
}: CheckoutAddressSectionProps) {
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:px-sop-24px lg:py-sop-20px mb-sop-16px">
      <div className="mb-sop-16px flex items-center gap-sop-8px">
        <MapPinIcon size={{ mobile: 24 }} color="#884ECF" />
        <h2 className="sop-body-md-medium lg:sop-body-lg-medium text-sop-primary-500">
          ที่อยู่จัดส่ง
        </h2>
      </div>

      {isAuthenticated ? (
        <SavedAddressList />
      ) : (
        <GuestAddressFields guestForm={guestForm} onGuestFormChange={onGuestFormChange} />
      )}
    </section>
  );
}
