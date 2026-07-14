'use client';

import { useApolloClient } from '@apollo/client/react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  MeDocument,
  ReactivateAccountDocument,
  SendCustomerOtpDocument,
  VerifyCustomerOtpDocument,
  ChangeCustomerPhoneDocument,
  type CustomerAuthPayload,
  type CustomerProfile,
  type MessagePayload,
} from '@/lib/graphql/generated/graphql';
import { clearTokens, getAccessToken, setOnAuthFailure, setTokens } from '@/lib/graphql/authLink';
import { getSessionId } from '@/lib/session';

export type AuthContextValue = {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingDeletion: boolean;
  sendOtp: (phone: string) => Promise<MessagePayload>;
  verifyOtp: (phone: string, code: string) => Promise<CustomerAuthPayload>;
  changeCustomerPhone: (phone: string, code: string) => Promise<CustomerAuthPayload>;
  reactivateAccount: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function hasStoredAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const apolloClient = useApolloClient();
  const [hasToken, setHasToken] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState(false);

  useLayoutEffect(() => {
    // Client-only hydration: sessionStorage is unavailable during SSR, so hasToken
    // must start false on the server render and sync once mounted in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasToken(hasStoredAccessToken());
    setIsAuthReady(true);
  }, []);

  const { data, loading, refetch } = useQuery(MeDocument, {
    skip: !hasToken,
  });

  const [sendOtpMutation] = useMutation(SendCustomerOtpDocument);
  const [verifyOtpMutation] = useMutation(VerifyCustomerOtpDocument);
  const [changeCustomerPhoneMutation] = useMutation(ChangeCustomerPhoneDocument);
  const [reactivateAccountMutation] = useMutation(ReactivateAccountDocument);

  const customer = data?.me?.customer ?? null;
  const isAuthenticated = hasToken;
  const isLoading = !isAuthReady || (hasToken && loading);

  const logout = useCallback(async () => {
    clearTokens();
    setHasToken(false);
    setPendingDeletion(false);
    await apolloClient.clearStore();
  }, [apolloClient]);

  const handleAuthFailure = useCallback(() => {
    clearTokens();
    setHasToken(false);
    setPendingDeletion(false);
  }, []);

  useEffect(() => {
    setOnAuthFailure(handleAuthFailure);

    return () => {
      setOnAuthFailure(() => {
        clearTokens();
      });
    };
  }, [handleAuthFailure]);

  const sendOtp = useCallback(
    async (phone: string): Promise<MessagePayload> => {
      const result = await sendOtpMutation({
        variables: { input: { phone } },
      });

      if (!result.data?.sendCustomerOtp) {
        throw new Error('ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }

      return result.data.sendCustomerOtp;
    },
    [sendOtpMutation],
  );

  const verifyOtp = useCallback(
    async (phone: string, code: string): Promise<CustomerAuthPayload> => {
      const sessionId = getSessionId() ?? undefined;
      const result = await verifyOtpMutation({
        variables: { input: { phone, code, sessionId } },
      });

      const payload = result.data?.verifyCustomerOtp;
      if (!payload) {
        throw new Error('รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }

      if (payload.pendingDeletion) {
        setPendingDeletion(true);
        return payload;
      }

      if (payload.tokens) {
        setTokens(payload.tokens.accessToken, payload.tokens.refreshToken);
        setHasToken(true);
        setPendingDeletion(false);
        await refetch();
      }

      return payload;
    },
    [verifyOtpMutation, refetch],
  );

  const changeCustomerPhone = useCallback(
    async (phone: string, code: string): Promise<CustomerAuthPayload> => {
      const result = await changeCustomerPhoneMutation({
        variables: { input: { phone, code } },
      });

      const payload = result.data?.changeCustomerPhone;
      if (!payload?.tokens) {
        throw new Error('ไม่สามารถเปลี่ยนเบอร์โทรศัพท์ได้ กรุณาลองใหม่อีกครั้ง');
      }

      setTokens(payload.tokens.accessToken, payload.tokens.refreshToken);
      setHasToken(true);
      setPendingDeletion(false);
      await refetch();

      return payload;
    },
    [changeCustomerPhoneMutation, refetch],
  );

  const reactivateAccount = useCallback(
    async (token: string): Promise<void> => {
      const result = await reactivateAccountMutation({
        variables: { input: { reactivationToken: token } },
      });

      const payload = result.data?.reactivateAccount;
      if (!payload?.tokens) {
        throw new Error('ไม่สามารถเปิดใช้งานบัญชีได้ กรุณาลองใหม่อีกครั้ง');
      }

      setTokens(payload.tokens.accessToken, payload.tokens.refreshToken);
      setHasToken(true);
      setPendingDeletion(false);
      await refetch();
    },
    [reactivateAccountMutation, refetch],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      isAuthenticated,
      isLoading,
      pendingDeletion,
      sendOtp,
      verifyOtp,
      changeCustomerPhone,
      reactivateAccount,
      logout,
    }),
    [
      customer,
      isAuthenticated,
      isLoading,
      pendingDeletion,
      sendOtp,
      verifyOtp,
      changeCustomerPhone,
      reactivateAccount,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
