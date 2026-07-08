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
  mapGuestFormToCreateAddressInput,
  validateAuthInlineShippingForm,
  validateGuestCheckoutForm,
  type GuestCheckoutField,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { prepareCardPayment } from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { useAuth } from '@/lib/hooks/useAuth';
import type { UseAddressesResult } from '@/lib/hooks/useAddresses';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export type AddressSubmitContext = {
  createAddress: UseAddressesResult['createAddress'];
  setAddress: (id: string | null) => void;
  saveAddressChecked: boolean;
  setFieldErrors: (errors: Partial<Record<GuestCheckoutField, string>>) => void;
  setShowFieldErrors: (show: boolean) => void;
  addressQueryError: Error | undefined;
  addressQueryLoading: boolean;
  addressCount: number;
};

export function useCheckoutSubmit(
  guestForm: GuestCheckoutFormState | null,
  options?: {
    addressSubmitContext?: AddressSubmitContext;
  },
) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedItems: items, selectedSubtotal: subtotal } = useCart();
  const checkoutMutations = useCheckoutMutations();
  const {
    step,
    shippingByStoreId,
    selectedAddressId,
    promotionCode,
    paymentMethod,
    storePromotionsByStoreId,
    canAdvanceToPayment,
    canAdvanceToReview,
    setStep,
    setAddress,
  } = useCheckout();
  const submitGuardRef = useRef(createSubmitCheckoutGuard());

  const addressSubmitContext = options?.addressSubmitContext;

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

  const isGuestCheckout = !isAuthenticated;

  const checkoutContext = useMemo(
    () => ({
      isAuthenticated: isAuthenticated && !isGuestCheckout,
      shippingByStoreId,
      selectedAddressId,
      promotionCode,
      storePromotionCodes: Object.values(storePromotionsByStoreId)
        .map((promotion) => promotion?.code?.trim())
        .filter((code): code is string => Boolean(code)),
      paymentMethod,
    }),
    [
      isAuthenticated,
      isGuestCheckout,
      paymentMethod,
      promotionCode,
      selectedAddressId,
      shippingByStoreId,
      storePromotionsByStoreId,
    ],
  );

  const isAuthPath = isAuthenticated && !isGuestCheckout;
  const addressQueryLoading = addressSubmitContext?.addressQueryLoading ?? false;
  const addressQueryError = addressSubmitContext?.addressQueryError;
  const addressCount = addressSubmitContext?.addressCount ?? 0;

  const isAuthInlineMode =
    isAuthPath && !addressQueryLoading && !addressQueryError && addressCount === 0;
  const isAuthSummaryMode =
    isAuthPath && !addressQueryLoading && !addressQueryError && addressCount > 0;
  const isAuthErrorMode = isAuthPath && Boolean(addressQueryError);

  const canSubmit =
    step === 'review' &&
    paymentMethod !== null &&
    items.length > 0 &&
    !(isAuthPath && (addressQueryLoading || addressQueryError));

  const executeSubmit = useCallback(
    async (overrideAddressId?: string | null) => {
      try {
        const cardPayment =
          paymentMethod === 'card' ? await prepareCardPayment() : undefined;

        const result = await submitCheckout(
          {
            step,
            checkoutContext: {
              ...checkoutContext,
              selectedAddressId: overrideAddressId ?? checkoutContext.selectedAddressId,
            },
            cart: { items },
            guestForm: isGuestCheckout ? guestForm : null,
            subtotal,
            checkoutHook: checkoutMutations,
            omiseToken:
              cardPayment?.type === 'token' ? cardPayment.omiseToken : undefined,
            savedPaymentMethodId:
              cardPayment?.type === 'saved' ? cardPayment.savedPaymentMethodId : undefined,
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
    },
    [
      checkoutContext,
      checkoutMutations,
      guestForm,
      isGuestCheckout,
      items,
      paymentMethod,
      router,
      step,
      subtotal,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      if (isAuthErrorMode) {
        toast.error('ไม่สามารถโหลดที่อยู่ได้ กรุณาลองอีกครั้ง');
      }
      return;
    }

    if (isAuthInlineMode) {
      if (!guestForm) {
        toast.error('กรุณากรอกข้อมูลการจัดส่ง');
        return;
      }

      const validation = validateAuthInlineShippingForm(guestForm);
      if (!validation.valid) {
        addressSubmitContext?.setShowFieldErrors(true);
        addressSubmitContext?.setFieldErrors(validation.errors);
        toast.error('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
        return;
      }

      const createAddress = addressSubmitContext?.createAddress;
      if (!createAddress) {
        toast.error('ไม่สามารถบันทึกที่อยู่ได้');
        return;
      }

      const created = await createAddress(
        mapGuestFormToCreateAddressInput(guestForm, {
          isDefault: addressSubmitContext.saveAddressChecked,
        }),
      );

      if (!created?.id) {
        toast.error('ไม่สามารถบันทึกที่อยู่ได้');
        return;
      }

      addressSubmitContext.setAddress(created.id);
      setAddress(created.id);

      try {
        await executeSubmit(created.id);
      } catch {
        // executeSubmit already surfaces toast errors
      }
      return;
    }

    if (isAuthSummaryMode && !selectedAddressId) {
      toast.error('กรุณาเลือกที่อยู่จัดส่ง');
      return;
    }

    if (isGuestCheckout || !isAuthenticated) {
      if (!guestForm) {
        toast.error('กรุณากรอกข้อมูลการจัดส่ง');
        return;
      }

      const validation = validateGuestCheckoutForm(guestForm);
      if (!validation.valid) {
        addressSubmitContext?.setShowFieldErrors(true);
        addressSubmitContext?.setFieldErrors(validation.errors);
        toast.error('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
        return;
      }
    }

    try {
      await executeSubmit();
    } catch {
      // executeSubmit already surfaces toast errors
    }
  }, [
    addressSubmitContext,
    canSubmit,
    executeSubmit,
    guestForm,
    isAuthenticated,
    isAuthErrorMode,
    isAuthInlineMode,
    isAuthSummaryMode,
    isGuestCheckout,
    selectedAddressId,
    setAddress,
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
  setPromotionName,
  setPromotionDiscount,
}: {
  code: string;
  subtotal: number;
  validatePromotion: ReturnType<typeof useCheckoutMutations>['validatePromotion'];
  setPromotion: (code: string | null) => void;
  setPromotionName: (name: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
}): Promise<void> {
  const validation = await validateCheckoutPromotionCode({
    code,
    subtotal,
    validatePromotion,
  });

  setPromotion(validation.code);
  setPromotionName(validation.name);
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
