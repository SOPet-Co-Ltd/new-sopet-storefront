'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  AddressForm,
  addressToFormValues,
  formValuesToCreateInput,
  type AddressFormValues,
} from '@/components/molecules/AddressForm/AddressForm';
import { useAddresses } from '@/lib/hooks/useAddresses';

type EditAddressFormProps = {
  addressId: string;
  initialValues: AddressFormValues;
};

function EditAddressForm({ addressId, initialValues }: EditAddressFormProps) {
  const router = useRouter();
  const { updateAddress } = useAddresses();
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateAddress(addressId, formValuesToCreateInput(values));
      router.push('/user/addresses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกที่อยู่ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddressForm
      values={values}
      onChange={setValues}
      onSubmit={() => void handleSubmit()}
      submitLabel="บันทึกการแก้ไข"
      loading={loading}
      error={error}
    />
  );
}

export default function EditAddressPage() {
  const params = useParams<{ id: string }>();
  const { addresses, loading: addressesLoading } = useAddresses();
  const address = addresses.find((item) => item.id === params.id);

  if (addressesLoading) {
    return (
      <AccountLayout title="แก้ไขที่อยู่">
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
      </AccountLayout>
    );
  }

  if (!address) {
    return (
      <AccountLayout title="แก้ไขที่อยู่">
        <p className="sop-body-sm-regular text-sop-system-error-400">ไม่พบที่อยู่</p>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="แก้ไขที่อยู่">
      <div className="max-w-lg">
        <EditAddressForm
          key={address.id}
          addressId={address.id}
          initialValues={addressToFormValues(address)}
        />
      </div>
    </AccountLayout>
  );
}
