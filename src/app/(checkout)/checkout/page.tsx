'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutErrorToast } from '@/components/atoms/CheckoutErrorToast/CheckoutErrorToast';
import { CheckoutMobileBottomBar } from '@/components/molecules/CheckoutMobileBottomBar/CheckoutMobileBottomBar';
import { CheckoutPaymentSelection } from '@/components/molecules/CheckoutPaymentSelection/CheckoutPaymentSelection';
import { CheckoutSummarySection } from '@/components/molecules/CheckoutSummarySection/CheckoutSummarySection';
import { CheckoutPromotionSection } from '@/components/sections/CheckoutPromotionSection/CheckoutPromotionSection';
import { CheckoutSection } from '@/components/sections/CheckoutSection/CheckoutSection';
import type { AddressSubmitContext } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import {
  GuestCheckoutOtpProvider,
  GuestOTPDialog,
  useGuestCheckoutOtp,
} from '@/components/organisms/GuestOTPDialog';
import type {
  GuestCheckoutField,
  GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { useCart } from '@/lib/providers/CartProvider';

const EMPTY_GUEST_FORM: GuestCheckoutFormState = {
  contactPhone: '',
  recipientFullName: '',
  recipientPhone: '',
  address: '',
  district: '',
  subDistrict: '',
  province: '',
  postalCode: '',
  email: '',
};

const FORM_FIELD_TO_ERROR_KEY: Partial<
  Record<keyof GuestCheckoutFormState, GuestCheckoutField>
> = {
  contactPhone: 'guestPhone',
  recipientPhone: 'recipientPhone',
  recipientFullName: 'recipientName',
  address: 'address',
  district: 'district',
  subDistrict: 'subDistrict',
  province: 'province',
  postalCode: 'postalCode',
  email: 'email',
};

function CheckoutPageReset() {
  const { reset } = useCheckout();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return null;
}

function CheckoutGuestOtpDialog({
  guestForm,
}: {
  guestForm: GuestCheckoutFormState;
}) {
  const {
    isDialogOpen,
    closeDialog,
    markPhoneVerified,
    consumeQueuedSubmit,
  } = useGuestCheckoutOtp();

  const handleVerified = async () => {
    markPhoneVerified();
    closeDialog();
    const submitFn = consumeQueuedSubmit();
    if (submitFn) {
      await submitFn();
    }
  };

  return (
    <GuestOTPDialog
      isOpen={isDialogOpen}
      initialPhone={guestForm.contactPhone}
      onVerified={() => {
        void handleVerified();
      }}
    />
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedItemCount: itemCount, loading } = useCart();
  const { setAddress } = useCheckout();
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    createAddress,
  } = useAddresses();

  const [guestForm, setGuestForm] = useState<GuestCheckoutFormState>(EMPTY_GUEST_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<GuestCheckoutField, string>>>(
    {},
  );
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);

  const addressSubmitContext = useMemo<AddressSubmitContext>(
    () => ({
      createAddress,
      setAddress,
      saveAddressChecked,
      setFieldErrors,
      setShowFieldErrors,
      addressQueryError: addressesError,
      addressQueryLoading: addressesLoading,
      addressCount: addresses.length,
    }),
    [
      addresses.length,
      addressesError,
      addressesLoading,
      createAddress,
      saveAddressChecked,
      setAddress,
    ],
  );

  const handleGuestFormChange = (field: keyof GuestCheckoutFormState, value: string) => {
    setGuestForm((prev) => ({ ...prev, [field]: value }));

    if (showFieldErrors) {
      const errorKey = FORM_FIELD_TO_ERROR_KEY[field];
      if (errorKey) {
        setFieldErrors((prev) => {
          if (!prev[errorKey]) return prev;
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
    }
  };

  useEffect(() => {
    if (!loading && itemCount === 0) {
      router.replace('/cart');
    }
  }, [itemCount, loading, router]);

  if (!loading && itemCount === 0) {
    return null;
  }

  return (
    <GuestCheckoutOtpProvider>
      <div data-testid="checkout-page">
        <CheckoutPageReset />
        <CheckoutErrorToast />
        <div className="lg:px-sop-80px flex flex-col gap-4 px-0 lg:pb-sop-80px lg:pt-sop-20px">
          <div className="flex flex-col gap-1 md:gap-5 xl:flex-row">
            <div className="flex-1 xl:min-w-112.5">
              <CheckoutSection
                guestForm={guestForm}
                onGuestFormChange={handleGuestFormChange}
                fieldErrors={fieldErrors}
                showFieldErrors={showFieldErrors}
                saveAddressChecked={saveAddressChecked}
                onSaveAddressPreferenceChange={setSaveAddressChecked}
                addressSubmitContext={addressSubmitContext}
              />
            </div>

            <div className="w-full p-4 lg:mt-19 lg:p-0 xl:max-w-105">
              <CheckoutPromotionSection />
              <CheckoutPaymentSelection />
              <CheckoutSummarySection
                guestForm={guestForm}
                addressSubmitContext={addressSubmitContext}
              />
            </div>
          </div>
        </div>
        <CheckoutMobileBottomBar
          guestForm={guestForm}
          addressSubmitContext={addressSubmitContext}
        />
        <CheckoutGuestOtpDialog guestForm={guestForm} />
      </div>
    </GuestCheckoutOtpProvider>
  );
}
