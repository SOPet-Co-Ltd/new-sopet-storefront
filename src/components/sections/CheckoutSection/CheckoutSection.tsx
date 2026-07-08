'use client';

import { useEffect } from 'react';
import type { GuestCheckoutField, GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import type { AddressSubmitContext } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { CheckoutAddressSection } from './CheckoutAddressSection';
import { CheckoutOrderItems } from './CheckoutOrderItems';

type CheckoutSectionProps = {
  guestForm: GuestCheckoutFormState;
  onGuestFormChange: (field: keyof GuestCheckoutFormState, value: string) => void;
  fieldErrors?: Partial<Record<GuestCheckoutField, string>>;
  showFieldErrors?: boolean;
  saveAddressChecked?: boolean;
  onSaveAddressPreferenceChange?: (checked: boolean) => void;
  addressSubmitContext?: AddressSubmitContext;
};

export function CheckoutSection({
  guestForm,
  onGuestFormChange,
  fieldErrors,
  showFieldErrors,
  saveAddressChecked,
  onSaveAddressPreferenceChange,
}: CheckoutSectionProps) {
  const { selectedItemsByStore: itemsByStore, loading, error } = useCart();
  const { setRequiredStoreIds } = useCheckout();

  useEffect(() => {
    setRequiredStoreIds(itemsByStore.map((group) => group.storeId));
  }, [itemsByStore, setRequiredStoreIds]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4" data-testid="checkout-loading">
        <div className="h-32 rounded-sop-16px bg-sop-neutral-gray-500" />
        <div className="h-48 rounded-sop-16px bg-sop-neutral-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-4 sop-body-sm-regular text-sop-system-error-500" data-testid="checkout-error">
        ไม่สามารถโหลดข้อมูลชำระเงินได้
      </p>
    );
  }

  return (
    <div data-testid="checkout-section">
      <CheckoutAddressSection
        guestForm={guestForm}
        onGuestFormChange={onGuestFormChange}
        fieldErrors={fieldErrors}
        showFieldErrors={showFieldErrors}
        saveAddressChecked={saveAddressChecked}
        onSaveAddressPreferenceChange={onSaveAddressPreferenceChange}
      />
      <div className="p-4">
        <CheckoutOrderItems groups={itemsByStore} />
      </div>
    </div>
  );
}
