'use client';

import { useEffect, useState } from 'react';
import {
  isCheckoutCardPaymentReady,
  subscribeCheckoutCardPaymentValidity,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

/**
 * When card payment is selected, pay stays disabled until the card form (or saved card) validates.
 */
export function useCheckoutCardPaymentReady(): boolean {
  const { paymentMethod } = useCheckout();
  const [cardReady, setCardReady] = useState(true);

  useEffect(() => {
    const sync = () => {
      setCardReady(isCheckoutCardPaymentReady());
    };

    sync();
    return subscribeCheckoutCardPaymentValidity(sync);
  }, [paymentMethod]);

  if (paymentMethod !== 'card') {
    return true;
  }

  return cardReady;
}
