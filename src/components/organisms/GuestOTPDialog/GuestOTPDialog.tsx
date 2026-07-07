'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';
import { GuestOTPOtpForm } from './GuestOTPOtpForm';
import { GuestOTPPhoneForm } from './GuestOTPPhoneForm';

type Step = 'PHONE' | 'OTP' | 'SUCCESS';

type GuestOTPDialogProps = {
  isOpen: boolean;
  initialPhone?: string;
  onVerified: (phone: string) => void;
};

function GuestOTPDialogContent({
  initialPhone,
  onVerified,
}: Omit<GuestOTPDialogProps, 'isOpen'>) {
  const { isAuthenticated, customer, sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone ?? '');
  const [isOtpError, setIsOtpError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resendInFlightRef = useRef(false);
  const autoSendAttemptedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    onVerified(customer?.phone ?? initialPhone ?? '');
  }, [customer?.phone, initialPhone, isAuthenticated, onVerified]);

  useEffect(() => {
    if (isAuthenticated || autoSendAttemptedRef.current) {
      return;
    }

    const normalizedPhone = normalizeThaiPhoneNumber(initialPhone ?? '');
    if (!isValidThaiPhoneNumber(normalizedPhone)) {
      return;
    }

    autoSendAttemptedRef.current = true;

    const sendInitialOtp = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await sendOtp(normalizedPhone);
        setPhoneNumber(normalizedPhone);
        setStep('OTP');
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'ไม่สามารถส่ง OTP ได้',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void sendInitialOtp();
  }, [initialPhone, isAuthenticated, sendOtp]);

  const handlePhoneSubmit = useCallback(
    async (phone: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await sendOtp(phone);
        setPhoneNumber(phone);
        setStep('OTP');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'ไม่สามารถส่ง OTP ได้');
      } finally {
        setIsLoading(false);
      }
    },
    [sendOtp],
  );

  const handleOtpSubmit = useCallback(
    async (otp: string) => {
      setIsLoading(true);
      try {
        await verifyOtp(phoneNumber, otp);
        setStep('SUCCESS');
      } catch {
        setIsOtpError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [phoneNumber, verifyOtp],
  );

  const handleResend = useCallback(async () => {
    if (isLoading || resendInFlightRef.current) {
      return;
    }

    resendInFlightRef.current = true;
    setIsLoading(true);
    try {
      await sendOtp(phoneNumber);
    } finally {
      resendInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [isLoading, phoneNumber, sendOtp]);

  const handleSuccessFinish = useCallback(() => {
    onVerified(phoneNumber);
  }, [onVerified, phoneNumber]);

  useEffect(() => {
    if (step !== 'SUCCESS') {
      return;
    }

    const timer = window.setTimeout(() => {
      handleSuccessFinish();
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [handleSuccessFinish, step]);

  if (isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" data-testid="guest-otp-dialog">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 flex min-h-[200px] w-full max-w-[500px] items-center justify-center rounded-3xl bg-sop-base-white p-6 shadow-xl md:p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sop-neutral-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" data-testid="guest-otp-dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-[500px] rounded-3xl bg-sop-base-white p-6 shadow-xl md:p-8">
        {step === 'PHONE' ? (
          <div className="flex flex-col gap-2">
            <GuestOTPPhoneForm
              initialPhone={initialPhone}
              onSubmit={(phone) => {
                void handlePhoneSubmit(phone);
              }}
              isLoading={isLoading}
            />
            {errorMessage ? (
              <p className="text-center sop-body-sm-regular text-sop-system-error-400">{errorMessage}</p>
            ) : null}
          </div>
        ) : null}

        {step === 'OTP' ? (
          <GuestOTPOtpForm
            phoneNumber={phoneNumber}
            onSubmit={(otp) => {
              void handleOtpSubmit(otp);
            }}
            onResend={() => {
              void handleResend();
            }}
            isError={isOtpError}
            onInputChange={() => setIsOtpError(false)}
            isLoading={isLoading}
          />
        ) : null}

        {step === 'SUCCESS' ? (
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sop-system-success-100">
              <CheckIcon size={{ mobile: 40 }} color="#22C55E" />
            </div>
            <h3 className="sop-headline-sm-medium text-sop-neutral-gray-200">ยืนยันเบอร์โทรศัพท์สำเร็จ</h3>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function GuestOTPDialog({ isOpen, initialPhone, onVerified }: GuestOTPDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <GuestOTPDialogContent
      key={initialPhone ?? 'guest-otp'}
      initialPhone={initialPhone}
      onVerified={onVerified}
    />
  );
}
