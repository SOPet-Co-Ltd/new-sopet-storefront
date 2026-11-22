'use client';

import { useLazyQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { CheckoutExistingCustomerModal } from '@/components/molecules/CheckoutExistingCustomerModal/CheckoutExistingCustomerModal';
import {
  getCustomerContactPrefill,
  type GuestCheckoutField,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { CustomerExistsByPhoneDocument } from '@/lib/graphql/generated/operations';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';
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
  const { selectedAddressId, setAddress, isSubmitting } = useCheckout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRecipientPhoneDirty, setIsRecipientPhoneDirty] = useState(false);
  const [existingCustomerModalOpen, setExistingCustomerModalOpen] = useState(false);
  const [existingCustomerPhone, setExistingCustomerPhone] = useState('');
  const [contactHydrateNonce, setContactHydrateNonce] = useState(0);
  const forceContactHydrateRef = useRef(false);
  const dismissedPhonesRef = useRef<Set<string>>(new Set());
  const promptedPhonesRef = useRef<Set<string>>(new Set());
  const [checkCustomerExists] = useLazyQuery(CustomerExistsByPhoneDocument, {
    fetchPolicy: 'network-only',
  });

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
    const shouldForce = forceContactHydrateRef.current;

    if (contactPhone && (shouldForce || !guestForm.contactPhone.trim())) {
      onGuestFormChange('contactPhone', contactPhone);
      if (!isRecipientPhoneDirty && (shouldForce || !guestForm.recipientPhone.trim())) {
        onGuestFormChange('recipientPhone', contactPhone);
      }
    }

    if (email && (shouldForce || !(guestForm.email ?? '').trim())) {
      onGuestFormChange('email', email);
    }

    if (shouldForce) {
      forceContactHydrateRef.current = false;
    }
  }, [
    contactHydrateNonce,
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
      if (isSubmitting) {
        return;
      }
      onGuestFormChange('contactPhone', value);
      if (!isRecipientPhoneDirty) {
        onGuestFormChange('recipientPhone', value);
      }
    },
    [isRecipientPhoneDirty, isSubmitting, onGuestFormChange],
  );

  const handleContactPhoneBlur = useCallback(async () => {
    if (isAuthenticated || isSubmitting || existingCustomerModalOpen) {
      return;
    }

    const normalized = normalizeThaiPhoneNumber(guestForm.contactPhone);
    if (!isValidThaiPhoneNumber(normalized)) {
      return;
    }

    if (dismissedPhonesRef.current.has(normalized) || promptedPhonesRef.current.has(normalized)) {
      return;
    }

    try {
      const result = await checkCustomerExists({
        variables: { input: { phone: normalized } },
      });

      if (result.error || !result.data?.customerExistsByPhone.exists) {
        return;
      }

      promptedPhonesRef.current.add(normalized);
      setExistingCustomerPhone(normalized);
      setExistingCustomerModalOpen(true);
    } catch {
      // Silent failure — guest continues checkout unchanged.
    }
  }, [
    checkCustomerExists,
    existingCustomerModalOpen,
    guestForm.contactPhone,
    isAuthenticated,
    isSubmitting,
  ]);

  const handleExistingCustomerClose = useCallback(() => {
    if (existingCustomerPhone) {
      dismissedPhonesRef.current.add(existingCustomerPhone);
    }
    setExistingCustomerModalOpen(false);
  }, [existingCustomerPhone]);

  const handleExistingCustomerLoginSuccess = useCallback(() => {
    forceContactHydrateRef.current = true;
    setExistingCustomerModalOpen(false);
    setContactHydrateNonce((nonce) => nonce + 1);
  }, []);

  useEffect(() => {
    if (addresses.length === 0) return;

    const addressIds = new Set(addresses.map((address) => address.id));
    const hasValidSelection = selectedAddressId && addressIds.has(selectedAddressId);

    if (!hasValidSelection) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, setAddress]);

  if (isSubmitting && isModalOpen) {
    setIsModalOpen(false);
  }

  const handleShippingChange = (field: keyof GuestCheckoutFormState, value: string) => {
    if (isSubmitting) {
      return;
    }
    if (field === 'recipientPhone') {
      setIsRecipientPhoneDirty(value !== '');
    }
    onGuestFormChange(field, value);
  };

  const handleCascadeReset = (fields: Array<keyof GuestCheckoutFormState>) => {
    if (isSubmitting) {
      return;
    }
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
          <fieldset
            disabled={isSubmitting}
            className="m-0 flex min-w-0 flex-col gap-sop-20px border-0 p-0 disabled:opacity-60"
          >
            <CheckoutContactSection
              contactPhone={guestForm.contactPhone}
              email={guestForm.email ?? ''}
              onContactPhoneChange={handleContactPhoneChange}
              onContactPhoneBlur={() => {
                void handleContactPhoneBlur();
              }}
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
          </fieldset>
        ) : null}

        {displayMode === 'auth-summary' && selectedAddress ? (
          <fieldset
            disabled={isSubmitting}
            className="m-0 flex min-w-0 flex-col gap-sop-20px border-0 p-0 disabled:opacity-60"
          >
            <SavedAddressSummaryCard
              address={selectedAddress}
              onChangeClick={() => setIsModalOpen(true)}
              isModalOpen={isModalOpen}
              disabled={isSubmitting}
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
            <CheckoutContactSection
              contactPhone={guestForm.contactPhone}
              email={guestForm.email ?? ''}
              onContactPhoneChange={handleContactPhoneChange}
              onEmailChange={(value) => onGuestFormChange('email', value)}
              errors={fieldErrors}
              showErrors={showFieldErrors}
              showPhone={false}
            />
          </fieldset>
        ) : null}

        {displayMode !== 'auth-loading' && displayMode !== 'auth-error' ? (
          <CheckoutAddressCardFooterPattern />
        ) : null}
      </div>

      <CheckoutExistingCustomerModal
        open={existingCustomerModalOpen}
        phone={existingCustomerPhone}
        onClose={handleExistingCustomerClose}
        onLoginSuccess={handleExistingCustomerLoginSuccess}
      />
    </section>
  );
}
