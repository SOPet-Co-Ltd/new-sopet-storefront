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
  SoftPromotionIneligibilityError,
  validateCheckoutPromotionCode,
} from '@/lib/checkout/validateCheckoutPromotion';
import {
  mapGuestFormToCreateAddressInput,
  validateAuthInlineShippingForm,
  validateGuestCheckoutForm,
  type GuestCheckoutField,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { parseStorePromotionConditions } from '@/lib/checkout/storePromotionUtils';
import { prepareCardPayment } from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import {
  cleanCardNumber,
  detectCardBrand,
} from '@/components/molecules/CheckoutPaymentSelection/paymentFormat';
import { setPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { parseCardExpiry } from '@/lib/payment/omise';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { useAuth } from '@/lib/hooks/useAuth';
import type { UseAddressesResult } from '@/lib/hooks/useAddresses';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useCheckoutCartSelection } from '@/lib/hooks/useCheckoutCartSelection';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { ensureSessionId } from '@/lib/session';

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
  const {
    selectedItems: items,
    selectedSubtotal: subtotal,
    refetch,
    pruneDeselectedIds,
    isBuyNow,
    clearBuyNow,
  } = useCheckoutCartSelection();
  const checkoutMutations = useCheckoutMutations();
  const { addPaymentMethod } = usePaymentMethods();
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
    isSubmitting,
    setIsSubmitting,
  } = useCheckout();
  const submitGuardRef = useRef(createSubmitCheckoutGuard());
  /** Sync lock so double-clicks before React re-renders are ignored. */
  const submittingRef = useRef(false);

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
      // Guest session cookie is resolved at submit time — ensureSessionId
      // must not run during render (client components still SSR).
      sessionId: null as string | null,
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

  const beginSubmitting = useCallback(() => {
    if (submittingRef.current) {
      return false;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    return true;
  }, [setIsSubmitting]);

  const endSubmitting = useCallback(() => {
    submittingRef.current = false;
    setIsSubmitting(false);
  }, [setIsSubmitting]);

  const executeSubmit = useCallback(
    async (overrideAddressId?: string | null): Promise<boolean> => {
      try {
        const cardPayment = paymentMethod === 'card' ? await prepareCardPayment() : undefined;

        let finalOmiseToken = cardPayment?.type === 'token' ? cardPayment.omiseToken : undefined;
        let finalSavedPaymentMethodId =
          cardPayment?.type === 'saved' ? cardPayment.savedPaymentMethodId : undefined;

        if (cardPayment?.type === 'token' && cardPayment.saveCardForNextTime) {
          const digits = cleanCardNumber(cardPayment.cardForm.cardNumber);
          const { month, year } = parseCardExpiry(cardPayment.cardForm.expiry);
          const brand = detectCardBrand(digits);

          const savedMethod = await addPaymentMethod({
            omiseCardToken: cardPayment.omiseToken,
            brand,
            lastFour: digits.slice(-4),
            expiryMonth: month,
            expiryYear: year,
            isDefault: true,
          });

          if (savedMethod) {
            finalSavedPaymentMethodId = savedMethod.id;
            finalOmiseToken = undefined;
          }
        }

        const result = await submitCheckout(
          {
            step,
            checkoutContext: {
              ...checkoutContext,
              selectedAddressId: overrideAddressId ?? checkoutContext.selectedAddressId,
              sessionId: isGuestCheckout ? ensureSessionId() : null,
            },
            cart: { items, includeCartItemIds: !isBuyNow },
            guestForm: isGuestCheckout ? guestForm : null,
            subtotal,
            checkoutHook: checkoutMutations,
            omiseToken: finalOmiseToken,
            savedPaymentMethodId: finalSavedPaymentMethodId,
          },
          submitGuardRef.current,
        );

        const checkedOutItemIds = items.map((item) => item.id);
        setPendingCheckout({
          paymentId: result.paymentId,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        });
        if (isBuyNow) {
          clearBuyNow();
        } else {
          pruneDeselectedIds(checkedOutItemIds);
          await refetch();
        }

        router.push(result.redirectPath);
        // Keep UI locked until unmount/reset so a slow navigation cannot double-submit.
        return true;
      } catch (error) {
        const message =
          error instanceof SubmitCheckoutError
            ? error.message
            : getErrorMessage(error, 'ไม่สามารถดำเนินการชำระเงินได้');

        toast.error(message);
        return false;
      }
    },
    [
      addPaymentMethod,
      checkoutContext,
      checkoutMutations,
      clearBuyNow,
      guestForm,
      isBuyNow,
      isGuestCheckout,
      items,
      paymentMethod,
      pruneDeselectedIds,
      refetch,
      router,
      step,
      subtotal,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || isSubmitting) {
      return;
    }

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

      if (!beginSubmitting()) {
        return;
      }

      try {
        const created = await createAddress(
          mapGuestFormToCreateAddressInput(guestForm, {
            isDefault: addressSubmitContext.saveAddressChecked,
          }),
        );

        if (!created?.id) {
          toast.error('ไม่สามารถบันทึกที่อยู่ได้');
          endSubmitting();
          return;
        }

        addressSubmitContext.setAddress(created.id);
        setAddress(created.id);

        const ok = await executeSubmit(created.id);
        if (!ok) {
          endSubmitting();
        }
      } catch {
        endSubmitting();
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

    if (!beginSubmitting()) {
      return;
    }

    try {
      const ok = await executeSubmit();
      if (!ok) {
        endSubmitting();
      }
    } catch {
      endSubmitting();
    }
  }, [
    addressSubmitContext,
    beginSubmitting,
    canSubmit,
    endSubmitting,
    executeSubmit,
    guestForm,
    isAuthenticated,
    isAuthErrorMode,
    isAuthInlineMode,
    isAuthSummaryMode,
    isGuestCheckout,
    isSubmitting,
    selectedAddressId,
    setAddress,
  ]);

  return {
    handleSubmit,
    isSubmitting,
    canSubmit,
    step,
  };
}

export async function applyCheckoutPromotionCode({
  code,
  subtotal,
  shippingFee,
  lines,
  promotions,
  validatePromotion,
  setPromotion,
  setPromotionName,
  setPromotionDiscount,
  setPromotionType,
  setPromotionFreeUnits,
  setPromotionProductId,
}: {
  code: string;
  subtotal: number;
  shippingFee?: number | null;
  lines?: import('@/lib/checkout/storePromotionUtils').PromotionEstimateCartLine[];
  promotions?: Array<{ code: string; conditions?: string | null; type?: string | null }>;
  validatePromotion: ReturnType<typeof useCheckoutMutations>['validatePromotion'];
  setPromotion: (code: string | null) => void;
  setPromotionName: (name: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
  setPromotionType?: (type: string | null) => void;
  setPromotionFreeUnits?: (freeUnits: number | null) => void;
  setPromotionProductId?: (productId: string | null) => void;
}): Promise<void> {
  const validation = await validateCheckoutPromotionCode({
    code,
    subtotal,
    shippingFee,
    lines,
    validatePromotion,
  });

  const matched = promotions?.find(
    (promotion) => promotion.code.toUpperCase() === validation.code.toUpperCase(),
  );
  const productId = matched
    ? (parseStorePromotionConditions(matched.conditions).productId ?? null)
    : null;

  setPromotion(validation.code);
  setPromotionName(validation.name);
  setPromotionDiscount(validation.discountAmount);
  setPromotionType?.(matched?.type ?? null);
  setPromotionFreeUnits?.(validation.freeUnits ?? null);
  setPromotionProductId?.(productId);
}

export function getPromotionApplyErrorMessage(error: unknown): string {
  if (error instanceof SoftPromotionIneligibilityError) {
    return error.message;
  }

  if (error instanceof PromotionValidationError) {
    return error.message;
  }

  return getErrorMessage(error, 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
}
