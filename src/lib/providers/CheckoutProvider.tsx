'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export type PaymentMethod = 'promptpay' | 'card' | 'cod';

export type ShippingSelection = {
  shippingOptionId: string;
};

export type CheckoutState = {
  step: CheckoutStep;
  shippingByStoreId: Record<string, ShippingSelection>;
  selectedAddressId: string | null;
  promotionCode: string | null;
  paymentMethod: PaymentMethod | null;
};

function createInitialCheckoutState(): CheckoutState {
  return {
    step: 'shipping',
    shippingByStoreId: {},
    selectedAddressId: null,
    promotionCode: null,
    paymentMethod: null,
  };
}

export type CheckoutContextValue = CheckoutState & {
  setStep: (step: CheckoutStep) => void;
  setShipping: (storeId: string, selection: ShippingSelection) => void;
  setAddress: (addressId: string | null) => void;
  setPromotion: (code: string | null) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  reset: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(createInitialCheckoutState);

  const reset = useCallback(() => {
    setState(createInitialCheckoutState());
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const setStep = useCallback((step: CheckoutStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setShipping = useCallback(
    (storeId: string, selection: ShippingSelection) => {
      setState((prev) => ({
        ...prev,
        shippingByStoreId: {
          ...prev.shippingByStoreId,
          [storeId]: selection,
        },
      }));
    },
    [],
  );

  const setAddress = useCallback((addressId: string | null) => {
    setState((prev) => ({ ...prev, selectedAddressId: addressId }));
  }, []);

  const setPromotion = useCallback((code: string | null) => {
    setState((prev) => ({ ...prev, promotionCode: code }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod | null) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...state,
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPaymentMethod,
      reset,
    }),
    [
      state,
      setStep,
      setShipping,
      setAddress,
      setPromotion,
      setPaymentMethod,
      reset,
    ],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
