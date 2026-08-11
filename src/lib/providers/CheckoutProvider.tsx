'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { StorePromotionSelection } from '@/lib/checkout/storePromotionUtils';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export type PaymentMethod = 'promptpay' | 'card' | 'cod';

export type ShippingSelection = {
  shippingOptionId: string;
  shippingFee?: number;
};

export type CheckoutState = {
  step: CheckoutStep;
  shippingByStoreId: Record<string, ShippingSelection>;
  selectedAddressId: string | null;
  promotionCode: string | null;
  promotionName: string | null;
  promotionDiscount: number;
  /** Platform promotion type (e.g. free_shipping) for checkout totals stacking. */
  promotionType: string | null;
  /** Platform BxGy Gate A — server freeUnits only. */
  promotionFreeUnits: number | null;
  /** Platform BxGy product P from conditions JSON. */
  promotionProductId: string | null;
  storePromotionsByStoreId: Record<string, StorePromotionSelection>;
  paymentMethod: PaymentMethod | null;
  requiredStoreIds: string[];
};

function createInitialCheckoutState(): CheckoutState {
  return {
    step: 'shipping',
    shippingByStoreId: {},
    selectedAddressId: null,
    promotionCode: null,
    promotionName: null,
    promotionDiscount: 0,
    promotionType: null,
    promotionFreeUnits: null,
    promotionProductId: null,
    storePromotionsByStoreId: {},
    paymentMethod: null,
    requiredStoreIds: [],
  };
}

export type CheckoutContextValue = CheckoutState & {
  /** True from pay-click until success navigation or failure unlock. Locks checkout UI. */
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  setStep: (step: CheckoutStep) => void;
  setShipping: (storeId: string, selection: ShippingSelection) => void;
  setAddress: (addressId: string | null) => void;
  setPromotion: (code: string | null) => void;
  setPromotionName: (name: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
  setPromotionType: (type: string | null) => void;
  setPromotionFreeUnits: (freeUnits: number | null) => void;
  setPromotionProductId: (productId: string | null) => void;
  setStorePromotion: (storeId: string, promotion: StorePromotionSelection) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setRequiredStoreIds: (storeIds: string[]) => void;
  canAdvanceToPayment: () => boolean;
  canAdvanceToReview: () => boolean;
  reset: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

function hasShippingForAllStores(
  requiredStoreIds: string[],
  shippingByStoreId: Record<string, ShippingSelection>,
): boolean {
  if (requiredStoreIds.length === 0) {
    return false;
  }

  return requiredStoreIds.every((storeId) => Boolean(shippingByStoreId[storeId]?.shippingOptionId));
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(createInitialCheckoutState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setState(createInitialCheckoutState());
    setIsSubmitting(false);
  }, []);

  const canAdvanceToPayment = useCallback(() => {
    return hasShippingForAllStores(state.requiredStoreIds, state.shippingByStoreId);
  }, [state.requiredStoreIds, state.shippingByStoreId]);

  const canAdvanceToReview = useCallback(() => {
    return state.paymentMethod !== null;
  }, [state.paymentMethod]);

  const setStep = useCallback((step: CheckoutStep) => {
    setState((prev) => {
      if (
        step === 'payment' &&
        !hasShippingForAllStores(prev.requiredStoreIds, prev.shippingByStoreId)
      ) {
        return prev;
      }

      if (step === 'review' && prev.paymentMethod === null) {
        return prev;
      }

      return { ...prev, step };
    });
  }, []);

  const setShipping = useCallback((storeId: string, selection: ShippingSelection) => {
    setState((prev) => ({
      ...prev,
      shippingByStoreId: {
        ...prev.shippingByStoreId,
        [storeId]: selection,
      },
    }));
  }, []);

  const setAddress = useCallback((addressId: string | null) => {
    setState((prev) => ({ ...prev, selectedAddressId: addressId }));
  }, []);

  const setPromotion = useCallback((code: string | null) => {
    setState((prev) => ({
      ...prev,
      promotionCode: code,
      promotionDiscount: code ? prev.promotionDiscount : 0,
      promotionName: code ? prev.promotionName : null,
      promotionType: code ? prev.promotionType : null,
      promotionFreeUnits: code ? prev.promotionFreeUnits : null,
      promotionProductId: code ? prev.promotionProductId : null,
    }));
  }, []);

  const setPromotionName = useCallback((name: string | null) => {
    setState((prev) => ({ ...prev, promotionName: name }));
  }, []);

  const setPromotionDiscount = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, promotionDiscount: amount }));
  }, []);

  const setPromotionType = useCallback((type: string | null) => {
    setState((prev) => ({ ...prev, promotionType: type }));
  }, []);

  const setPromotionFreeUnits = useCallback((freeUnits: number | null) => {
    setState((prev) => ({ ...prev, promotionFreeUnits: freeUnits }));
  }, []);

  const setPromotionProductId = useCallback((productId: string | null) => {
    setState((prev) => ({ ...prev, promotionProductId: productId }));
  }, []);

  const setStorePromotion = useCallback((storeId: string, promotion: StorePromotionSelection) => {
    setState((prev) => ({
      ...prev,
      storePromotionsByStoreId: {
        ...prev.storePromotionsByStoreId,
        [storeId]: promotion,
      },
    }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod | null) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setRequiredStoreIds = useCallback((storeIds: string[]) => {
    setState((prev) => ({ ...prev, requiredStoreIds: storeIds }));
  }, []);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...state,
      isSubmitting,
      setIsSubmitting,
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPromotionName,
      setPromotionDiscount,
      setPromotionType,
      setPromotionFreeUnits,
      setPromotionProductId,
      setStorePromotion,
      setPaymentMethod,
      setRequiredStoreIds,
      canAdvanceToPayment,
      canAdvanceToReview,
      reset,
    }),
    [
      state,
      isSubmitting,
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPromotionName,
      setPromotionDiscount,
      setPromotionType,
      setPromotionFreeUnits,
      setPromotionProductId,
      setStorePromotion,
      setPaymentMethod,
      setRequiredStoreIds,
      canAdvanceToPayment,
      canAdvanceToReview,
      reset,
    ],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
