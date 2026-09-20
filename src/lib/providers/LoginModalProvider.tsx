'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LoginNotice } from '@/components/molecules/LoginForm/LoginForm';
import { LoginModal } from '@/components/organisms/LoginModal/LoginModal';

export type OpenLoginModalOptions = {
  notice?: LoginNotice;
};

type LoginModalContextValue = {
  isOpen: boolean;
  notice: LoginNotice;
  openLoginModal: (options?: OpenLoginModalOptions) => void;
  closeLoginModal: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<LoginNotice>(null);

  const openLoginModal = useCallback((options?: OpenLoginModalOptions) => {
    setNotice(options?.notice ?? null);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
    setNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      notice,
      openLoginModal,
      closeLoginModal,
    }),
    [isOpen, notice, openLoginModal, closeLoginModal],
  );

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider');
  }
  return context;
}
