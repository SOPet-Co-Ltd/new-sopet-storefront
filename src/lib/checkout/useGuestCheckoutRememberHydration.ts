'use client';

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { loadGuestCheckoutRemember } from '@/lib/checkout/guestCheckoutRemember';

/**
 * One-shot guest form hydrate from localStorage after a prior successful guest order.
 * No-op while auth is loading or when the shopper is authenticated.
 */
export function useGuestCheckoutRememberHydration(
  isAuthenticated: boolean,
  authLoading: boolean,
  setGuestForm: Dispatch<SetStateAction<GuestCheckoutFormState>>,
): void {
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if (authLoading || isAuthenticated || didHydrateRef.current) {
      return;
    }
    didHydrateRef.current = true;
    const remembered = loadGuestCheckoutRemember();
    if (remembered?.form) {
      setGuestForm((prev) => ({ ...prev, ...remembered.form }));
    }
  }, [authLoading, isAuthenticated, setGuestForm]);
}
