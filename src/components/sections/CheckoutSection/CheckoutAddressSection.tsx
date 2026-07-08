'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPinIcon } from '@/components/atoms/icons';
import {
  AddressManagementModal,
  AuthSaveAddressCheckbox,
  CheckoutAddressCardFooterPattern,
  CheckoutAddressErrorState,
  CheckoutAddressSectionSkeleton,
  CheckoutContactSection,
  SavedAddressSummaryCard,
  ShippingAddressFields,
  resolveDisplayMode,
} from '@/components/molecules/CheckoutAddress';
import {
  getCustomerContactPrefill,
  type GuestCheckoutField,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export type CheckoutAddressSectionProps = {
  guestForm: GuestCheckoutFormState;
  onGuestFormChange: (field: keyof GuestCheckoutFormState, value: string) => void;
  fieldErrors?: Partial<Record<GuestCheckoutField, string>>;
  showFieldErrors?: boolean;
  saveAddressChecked?: boolean;
  onSaveAddressPreferenceChange?: (checked: boolean) => void;
};

export function CheckoutAddressSection({
  guestForm,
  onGuestFormChange,
  fieldErrors,
  showFieldErrors = false,
  saveAddressChecked = false,
  onSaveAddressPreferenceChange,
}: CheckoutAddressSectionProps) {
  const { isAuthenticated, customer } = useAuth();
  const { addresses, loading, error, refetch, ...addressesApi } = useAddresses();
  const { selectedAddressId, setAddress } = useCheckout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRecipientPhoneDirty, setIsRecipientPhoneDirty] = useState(false);

  const displayMode = resolveDisplayMode({
    isAuthenticated,
    loading,
    error,
    addressCount: addresses.length,
  });

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    if (!isAuthenticated || !customer) return;

    const { contactPhone, email } = getCustomerContactPrefill(customer);

    if (contactPhone && !guestForm.contactPhone.trim()) {
      onGuestFormChange('contactPhone', contactPhone);
      if (!isRecipientPhoneDirty && !guestForm.recipientPhone.trim()) {
        onGuestFormChange('recipientPhone', contactPhone);
      }
    }

    if (email && !(guestForm.email ?? '').trim()) {
      onGuestFormChange('email', email);
    }
  }, [
    customer,
    guestForm.contactPhone,
    guestForm.email,
    guestForm.recipientPhone,
    isRecipientPhoneDirty,
    isAuthenticated,
    onGuestFormChange,
  ]);

  const handleContactPhoneChange = useCallback(
    (value: string) => {
      onGuestFormChange('contactPhone', value);
      if (!isRecipientPhoneDirty) {
        onGuestFormChange('recipientPhone', value);
      }
    },
    [isRecipientPhoneDirty, onGuestFormChange],
  );

  useEffect(() => {
    if (addresses.length === 0) return;

    const addressIds = new Set(addresses.map((address) => address.id));
    const hasValidSelection = selectedAddressId && addressIds.has(selectedAddressId);

    if (!hasValidSelection) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, setAddress]);

  const handleShippingChange = (field: keyof GuestCheckoutFormState, value: string) => {
    if (field === 'recipientPhone') {
      setIsRecipientPhoneDirty(value !== '');
    }
    onGuestFormChange(field, value);
  };

  const handleCascadeReset = (fields: Array<keyof GuestCheckoutFormState>) => {
    for (const field of fields) {
      onGuestFormChange(field, '');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <section
      className="px-sop-16px py-sop-20px"
      aria-label="ข้อมูลการจัดส่ง"
      data-testid="checkout-address-section"
    >
      <div className="mb-sop-12px flex items-center gap-sop-8px">
        <MapPinIcon size={{ mobile: 24 }} color="#9C6ADE" />
        <h2 className="sop-body-sm-medium text-sop-primary-500 lg:sop-body-md-medium">
          ข้อมูลการจัดส่ง
        </h2>
      </div>

      <div
        className="relative overflow-hidden rounded-sop-20px bg-sop-base-white px-sop-16px pb-sop-40px pt-sop-24px lg:px-sop-24px"
        data-testid={`checkout-address-mode-${displayMode}`}
      >
        {displayMode === 'auth-loading' ? <CheckoutAddressSectionSkeleton /> : null}

        {displayMode === 'auth-error' ? (
          <CheckoutAddressErrorState onRetry={handleRetry} isRetrying={isRetrying} />
        ) : null}

        {displayMode === 'guest' || displayMode === 'auth-inline' ? (
          <div className="flex flex-col gap-sop-20px">
            <CheckoutContactSection
              contactPhone={guestForm.contactPhone}
              email={guestForm.email ?? ''}
              onContactPhoneChange={handleContactPhoneChange}
              onEmailChange={(value) => onGuestFormChange('email', value)}
              errors={fieldErrors}
              showErrors={showFieldErrors}
            />
            <ShippingAddressFields
              values={guestForm}
              onChange={handleShippingChange}
              onCascadeReset={handleCascadeReset}
              errors={fieldErrors}
              showErrors={showFieldErrors}
            />
            {displayMode === 'auth-inline' ? (
              <AuthSaveAddressCheckbox
                checked={saveAddressChecked}
                onChange={(checked) => onSaveAddressPreferenceChange?.(checked)}
              />
            ) : null}
          </div>
        ) : null}

        {displayMode === 'auth-summary' && selectedAddress ? (
          <>
            <SavedAddressSummaryCard
              address={selectedAddress}
              onChangeClick={() => setIsModalOpen(true)}
              isModalOpen={isModalOpen}
            />
            <AddressManagementModal
              key={isModalOpen ? 'address-modal-open' : 'address-modal-closed'}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onConfirmSelection={setAddress}
              addressesApi={addressesApi}
            />
          </>
        ) : null}

        {displayMode !== 'auth-loading' && displayMode !== 'auth-error' ? (
          <CheckoutAddressCardFooterPattern />
        ) : null}
      </div>
    </section>
  );
}
