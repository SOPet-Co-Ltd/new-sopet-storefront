'use client';

import { useEffect, useRef } from 'react';
import { importRememberedGuestAddress } from '@/lib/checkout/importRememberedGuestAddress';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * After OTP login, if this browser has a guest checkout remember snapshot whose
 * contact phone matches the account, create that address once (skip duplicates).
 * Mount under AuthProvider. Renders nothing.
 */
export function GuestAddressImportOnLogin() {
  const { isAuthenticated, isLoading: authLoading, customer } = useAuth();
  const { addresses, loading: addressesLoading, createAddress } = useAddresses();
  const inFlightRef = useRef(false);
  const lastAttemptPhoneRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      lastAttemptPhoneRef.current = null;
      inFlightRef.current = false;
      return;
    }

    if (authLoading || addressesLoading || !customer?.phone) {
      return;
    }

    if (lastAttemptPhoneRef.current === customer.phone || inFlightRef.current) {
      return;
    }

    lastAttemptPhoneRef.current = customer.phone;
    inFlightRef.current = true;

    void importRememberedGuestAddress({
      accountPhone: customer.phone,
      addresses,
      createAddress,
    })
      .catch(() => {
        // Silent — login must not fail because import failed.
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [addresses, addressesLoading, authLoading, createAddress, customer?.phone, isAuthenticated]);

  return null;
}
