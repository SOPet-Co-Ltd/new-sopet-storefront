'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPinIcon } from '@/components/atoms/icons';
import {
  AddressManagementModal,
  AuthSaveAddressCheckbox,
  CheckoutAddressErrorState,
  CheckoutAddressSectionSkeleton,
  CheckoutContactSection,
  SavedAddressSummaryCard,
  ShippingAddressFields,
  resolveDisplayMode,
} from '@/components/molecules/CheckoutAddress';
import type { GuestCheckoutField, GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
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
  const { isAuthenticated } = useAuth();
  const { addresses, loading, error, refetch, ...addressesApi } = useAddresses();
  const { selectedAddressId, setAddress } = useCheckout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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
    if (addresses.length === 0) return;

    const addressIds = new Set(addresses.map((address) => address.id));
    const hasValidSelection = selectedAddressId && addressIds.has(selectedAddressId);

    if (!hasValidSelection) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, setAddress]);

  const handleShippingChange = (field: keyof GuestCheckoutFormState, value: string) => {
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
      className="mb-sop-16px w-full rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:px-sop-24px lg:py-sop-20px"
      aria-label="ที่อยู่จัดส่ง"
      data-testid="checkout-address-section"
    >
      <div className="mb-sop-16px flex items-center gap-sop-8px">
        <MapPinIcon size={{ mobile: 24 }} color="#884ECF" />
        <h2 className="sop-body-md-medium lg:sop-body-lg-medium text-sop-primary-500">
          ที่อยู่จัดส่ง
        </h2>
      </div>

      <div data-testid={`checkout-address-mode-${displayMode}`}>
        {displayMode === 'auth-loading' ? <CheckoutAddressSectionSkeleton /> : null}

        {displayMode === 'auth-error' ? (
          <CheckoutAddressErrorState onRetry={handleRetry} isRetrying={isRetrying} />
        ) : null}

        {displayMode === 'guest' ? (
          <>
            <CheckoutContactSection
              contactPhone={guestForm.contactPhone}
              email={guestForm.email ?? ''}
              onContactPhoneChange={(value) => onGuestFormChange('contactPhone', value)}
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
          </>
        ) : null}

        {displayMode === 'auth-inline' ? (
          <>
            <ShippingAddressFields
              values={guestForm}
              onChange={handleShippingChange}
              onCascadeReset={handleCascadeReset}
              errors={fieldErrors}
              showErrors={showFieldErrors}
            />
            <AuthSaveAddressCheckbox
              checked={saveAddressChecked}
              onChange={(checked) => onSaveAddressPreferenceChange?.(checked)}
            />
          </>
        ) : null}

        {displayMode === 'auth-summary' && selectedAddress ? (
          <>
            <SavedAddressSummaryCard
              address={selectedAddress}
              onChangeClick={() => setIsModalOpen(true)}
              isModalOpen={isModalOpen}
            />
            <AddressManagementModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onConfirmSelection={setAddress}
              addressesApi={addressesApi}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
