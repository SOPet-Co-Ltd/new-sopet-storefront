'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutErrorToast } from '@/components/atoms/CheckoutErrorToast/CheckoutErrorToast';
import { CheckoutMobileBottomBar } from '@/components/molecules/CheckoutMobileBottomBar/CheckoutMobileBottomBar';
import { CheckoutPaymentSelection } from '@/components/molecules/CheckoutPaymentSelection/CheckoutPaymentSelection';
import { CheckoutSummarySection } from '@/components/molecules/CheckoutSummarySection/CheckoutSummarySection';
import { CheckoutPromotionSection } from '@/components/sections/CheckoutPromotionSection/CheckoutPromotionSection';
import { CheckoutSection } from '@/components/sections/CheckoutSection/CheckoutSection';
import {
  GuestCheckoutOtpProvider,
  GuestOTPDialog,
  useGuestCheckoutOtp,
} from '@/components/organisms/GuestOTPDialog';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

const EMPTY_GUEST_FORM: GuestCheckoutFormState = {
  contactPhone: '',
  recipientFullName: '',
  recipientPhone: '',
  address: '',
  district: '',
  province: '',
  postalCode: '',
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
  const { itemCount, loading } = useCart();
  const [guestForm, setGuestForm] = useState<GuestCheckoutFormState>(EMPTY_GUEST_FORM);

  const handleGuestFormChange = (field: keyof GuestCheckoutFormState, value: string) => {
    setGuestForm((prev) => ({ ...prev, [field]: value }));
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
              <CheckoutSection guestForm={guestForm} onGuestFormChange={handleGuestFormChange} />
            </div>

            <div className="w-full p-4 lg:mt-19 lg:p-0 xl:max-w-105">
              <CheckoutPromotionSection />
              <CheckoutPaymentSelection />
              <CheckoutSummarySection guestForm={guestForm} />
            </div>
          </div>
        </div>
        <CheckoutMobileBottomBar guestForm={guestForm} />
        <CheckoutGuestOtpDialog guestForm={guestForm} />
      </div>
    </GuestCheckoutOtpProvider>
  );
}
