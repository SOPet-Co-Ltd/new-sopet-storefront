'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createSubmitCheckoutGuard,
  submitCheckout,
  SubmitCheckoutError,
} from '@/lib/checkout/submitCheckout';
import {
  PromotionValidationError,
  validateCheckoutPromotionCode,
} from '@/lib/checkout/validateCheckoutPromotion';
import {
  validateGuestCheckoutForm,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { prepareCardPaymentToken } from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { useGuestCheckoutOtp } from '@/components/organisms/GuestOTPDialog';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export function useCheckoutSubmit(guestForm: GuestCheckoutFormState | null) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, subtotal } = useCart();
  const checkoutMutations = useCheckoutMutations();
  const {
    isPhoneVerified,
    openDialog,
    queueSubmit,
  } = useGuestCheckoutOtp();
  const {
    step,
    shippingByStoreId,
    selectedAddressId,
    promotionCode,
    paymentMethod,
    canAdvanceToPayment,
    canAdvanceToReview,
    setStep,
  } = useCheckout();
  const submitGuardRef = useRef(createSubmitCheckoutGuard());

  useEffect(() => {
    if (step === 'shipping' && canAdvanceToPayment()) {
      setStep('payment');
    }
  }, [canAdvanceToPayment, setStep, step]);

  useEffect(() => {
    if (step === 'payment' && canAdvanceToReview()) {
      setStep('review');
    }
  }, [canAdvanceToReview, setStep, step]);

  const isGuestCheckout = Boolean(guestForm?.contactPhone?.trim());

  const checkoutContext = useMemo(
    () => ({
      isAuthenticated: isAuthenticated && !isGuestCheckout,
      shippingByStoreId,
      selectedAddressId,
      promotionCode,
      paymentMethod,
    }),
    [
      isAuthenticated,
      isGuestCheckout,
      paymentMethod,
      promotionCode,
      selectedAddressId,
      shippingByStoreId,
    ],
  );

  const canSubmit = step === 'review' && paymentMethod !== null && items.length > 0;

  const executeSubmit = useCallback(async () => {
    try {
      const omiseToken =
        paymentMethod === 'card' ? await prepareCardPaymentToken() : undefined;

      const result = await submitCheckout(
        {
          step,
          checkoutContext,
          cart: { items },
          guestForm: isGuestCheckout ? guestForm : null,
          subtotal,
          checkoutHook: checkoutMutations,
          omiseToken,
        },
        submitGuardRef.current,
      );

      router.push(result.redirectPath);
    } catch (error) {
      const message =
        error instanceof SubmitCheckoutError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'ไม่สามารถดำเนินการชำระเงินได้';

      toast.error(message);
    }
  }, [
    checkoutContext,
    checkoutMutations,
    guestForm,
    isGuestCheckout,
    items,
    paymentMethod,
    router,
    step,
    subtotal,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    if (isGuestCheckout || !isAuthenticated) {
      if (!guestForm) {
        toast.error('กรุณากรอกข้อมูลการจัดส่ง');
        return;
      }

      const validation = validateGuestCheckoutForm(guestForm);
      if (!validation.valid) {
        toast.error('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
        return;
      }
    }

    if (isGuestCheckout && !isPhoneVerified) {
      queueSubmit(() => executeSubmit());
      openDialog();
      return;
    }

    try {
      await executeSubmit();
    } catch {
      // executeSubmit already surfaces toast errors
    }
  }, [
    canSubmit,
    executeSubmit,
    guestForm,
    isAuthenticated,
    isGuestCheckout,
    isPhoneVerified,
    openDialog,
    queueSubmit,
  ]);

  return {
    handleSubmit,
    isSubmitting: checkoutMutations.loading,
    canSubmit,
    step,
  };
}

export async function applyCheckoutPromotionCode({
  code,
  subtotal,
  validatePromotion,
  setPromotion,
  setPromotionDiscount,
}: {
  code: string;
  subtotal: number;
  validatePromotion: ReturnType<typeof useCheckoutMutations>['validatePromotion'];
  setPromotion: (code: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
}): Promise<void> {
  const validation = await validateCheckoutPromotionCode({
    code,
    subtotal,
    validatePromotion,
  });

  setPromotion(validation.code);
  setPromotionDiscount(validation.discountAmount);
}

export function getPromotionApplyErrorMessage(error: unknown): string {
  if (error instanceof PromotionValidationError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว';
}
