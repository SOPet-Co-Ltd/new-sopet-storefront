'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutErrorToast } from '@/components/atoms/CheckoutErrorToast/CheckoutErrorToast';
import { CheckoutMobileBottomBar } from '@/components/molecules/CheckoutMobileBottomBar/CheckoutMobileBottomBar';
import { CheckoutPaymentSelection } from '@/components/molecules/CheckoutPaymentSelection/CheckoutPaymentSelection';
import { CheckoutSummarySection } from '@/components/molecules/CheckoutSummarySection/CheckoutSummarySection';
import { CheckoutPromotionSection } from '@/components/sections/CheckoutPromotionSection/CheckoutPromotionSection';
import { CheckoutAutoApplyController } from '@/components/sections/CheckoutSection/CheckoutAutoApplyController';
import { CheckoutSection } from '@/components/sections/CheckoutSection/CheckoutSection';
import type { AddressSubmitContext } from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import type {
  GuestCheckoutField,
  GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { consumeCheckoutEntryAllowed, getPendingCheckout } from '@/lib/checkout/pendingCheckout';
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

const FORM_FIELD_TO_ERROR_KEY: Partial<Record<keyof GuestCheckoutFormState, GuestCheckoutField>> = {
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

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedItemCount, loading } = useCart();
  const { setAddress } = useCheckout();
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    createAddress,
  } = useAddresses();

  const [guestForm, setGuestForm] = useState<GuestCheckoutFormState>(EMPTY_GUEST_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<GuestCheckoutField, string>>>({});
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

  // Resume pending payment immediately for direct /checkout visits — do not wait
  // for the cart query, because checked-out items are already removed from cart.
  useLayoutEffect(() => {
    const pendingCheckout = getPendingCheckout();
    if (!pendingCheckout) {
      return;
    }

    const allowedEntry = consumeCheckoutEntryAllowed();
    if (!allowedEntry) {
      router.replace(`/payment/${pendingCheckout.paymentId}`);
    }
  }, [router]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const pendingCheckout = getPendingCheckout();

    if (pendingCheckout && selectedItemCount === 0) {
      router.replace(`/payment/${pendingCheckout.paymentId}`);
      return;
    }

    if (selectedItemCount === 0) {
      router.replace('/cart');
    }
  }, [loading, router, selectedItemCount]);

  if (!loading && selectedItemCount === 0) {
    return null;
  }

  return (
    <div data-testid="checkout-page">
      <CheckoutPageReset />
      <CheckoutAutoApplyController />
      <CheckoutErrorToast />
      <div className="lg:px-sop-80px flex flex-col px-0 lg:pb-sop-80px lg:pt-sop-20px">
        <div className="flex w-full flex-col gap-sop-16px xl:flex-row xl:items-start xl:gap-sop-20px">
          <div className="min-w-0 flex-1">
            <CheckoutSection
              guestForm={guestForm}
              onGuestFormChange={handleGuestFormChange}
              fieldErrors={fieldErrors}
              showFieldErrors={showFieldErrors}
              saveAddressChecked={saveAddressChecked}
              onSaveAddressPreferenceChange={setSaveAddressChecked}
            />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-sop-12px px-sop-16px pb-sop-40px xl:w-[413px] xl:px-0 xl:pt-[60px]">
            <CheckoutPromotionSection />
            <CheckoutPaymentSelection />
            <CheckoutSummarySection
              guestForm={guestForm}
              addressSubmitContext={addressSubmitContext}
            />
          </div>
        </div>
      </div>
      <CheckoutMobileBottomBar guestForm={guestForm} addressSubmitContext={addressSubmitContext} />
    </div>
  );
}
