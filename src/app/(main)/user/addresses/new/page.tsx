'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  AddressForm,
  EMPTY_ADDRESS_FORM,
  formValuesToCreateInput,
  type AddressFormValues,
} from '@/components/molecules/AddressForm/AddressForm';
import { useAddresses } from '@/lib/hooks/useAddresses';

export default function NewAddressPage() {
  const router = useRouter();
  const { createAddress } = useAddresses();
  const [values, setValues] = useState<AddressFormValues>(EMPTY_ADDRESS_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!values.label.trim() || !values.fullName.trim() || !values.phone.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createAddress(formValuesToCreateInput(values));
      router.push('/user/addresses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกที่อยู่ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="เพิ่มที่อยู่ใหม่">
      <div className="mx-auto max-w-2xl">
        <AddressForm
          values={values}
          onChange={setValues}
          onSubmit={() => void handleSubmit()}
          loading={loading}
          error={error}
        />
      </div>
    </AccountLayout>
  );
}
