'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type GuestCheckoutOtpContextValue = {
  isPhoneVerified: boolean;
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  markPhoneVerified: () => void;
  queueSubmit: (submitFn: () => Promise<void>) => void;
  consumeQueuedSubmit: () => (() => Promise<void>) | null;
};

const GuestCheckoutOtpContext = createContext<GuestCheckoutOtpContextValue | null>(null);

const noopGuestCheckoutOtp: GuestCheckoutOtpContextValue = {
  isPhoneVerified: true,
  isDialogOpen: false,
  openDialog: () => undefined,
  closeDialog: () => undefined,
  markPhoneVerified: () => undefined,
  queueSubmit: () => undefined,
  consumeQueuedSubmit: () => null,
};

export function GuestCheckoutOtpProvider({ children }: { children: ReactNode }) {
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queuedSubmitRef = useRef<(() => Promise<void>) | null>(null);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const markPhoneVerified = useCallback(() => {
    setIsPhoneVerified(true);
  }, []);

  const queueSubmit = useCallback((submitFn: () => Promise<void>) => {
    queuedSubmitRef.current = submitFn;
  }, []);

  const consumeQueuedSubmit = useCallback(() => {
    const submitFn = queuedSubmitRef.current;
    queuedSubmitRef.current = null;
    return submitFn;
  }, []);

  const value = useMemo(
    () => ({
      isPhoneVerified,
      isDialogOpen,
      openDialog,
      closeDialog,
      markPhoneVerified,
      queueSubmit,
      consumeQueuedSubmit,
    }),
    [
      closeDialog,
      consumeQueuedSubmit,
      isDialogOpen,
      isPhoneVerified,
      markPhoneVerified,
      openDialog,
      queueSubmit,
    ],
  );

  return (
    <GuestCheckoutOtpContext.Provider value={value}>{children}</GuestCheckoutOtpContext.Provider>
  );
}

export function useGuestCheckoutOtp(): GuestCheckoutOtpContextValue {
  const context = useContext(GuestCheckoutOtpContext);
  return context ?? noopGuestCheckoutOtp;
}
