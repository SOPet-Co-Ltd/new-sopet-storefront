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
    storePromotionsByStoreId: {},
    paymentMethod: null,
    requiredStoreIds: [],
  };
}

export type CheckoutContextValue = CheckoutState & {
  setStep: (step: CheckoutStep) => void;
  setShipping: (storeId: string, selection: ShippingSelection) => void;
  setAddress: (addressId: string | null) => void;
  setPromotion: (code: string | null) => void;
  setPromotionName: (name: string | null) => void;
  setPromotionDiscount: (amount: number) => void;
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

  const reset = useCallback(() => {
    setState(createInitialCheckoutState());
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
    }));
  }, []);

  const setPromotionName = useCallback((name: string | null) => {
    setState((prev) => ({ ...prev, promotionName: name }));
  }, []);

  const setPromotionDiscount = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, promotionDiscount: amount }));
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
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPromotionName,
      setPromotionDiscount,
      setStorePromotion,
      setPaymentMethod,
      setRequiredStoreIds,
      canAdvanceToPayment,
      canAdvanceToReview,
      reset,
    }),
    [
      state,
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPromotionName,
      setPromotionDiscount,
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
