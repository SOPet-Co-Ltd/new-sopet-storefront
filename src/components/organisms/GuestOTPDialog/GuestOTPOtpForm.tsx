'use client';

import { useEffect, useRef, useState } from 'react';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';

type GuestOTPOtpFormProps = {
  phoneNumber: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  isError?: boolean;
  onInputChange?: () => void;
  isLoading?: boolean;
};

export function GuestOTPOtpForm({
  phoneNumber,
  onSubmit,
  onResend,
  isError = false,
  onInputChange,
  isLoading = false,
}: GuestOTPOtpFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastSubmittedOtp = useRef('');

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.length > 1 ? value[0] : value;
    if (!/^\d*$/.test(nextValue)) {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);
    onInputChange?.();

    if (nextValue !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (!otp.every((digit) => digit !== '')) {
      lastSubmittedOtp.current = '';
      return;
    }

    const otpString = otp.join('');
    if (otpString !== lastSubmittedOtp.current) {
      lastSubmittedOtp.current = otpString;
      onSubmit(otpString);
    }
  }, [onSubmit, otp]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 text-center">
      <div className="space-y-2 text-left">
        <h3 className="sop-headline-sm-medium text-sop-neutral-gray-200" id="guest-otp-form-title">
          ยืนยันเบอร์มือถือของคุณ
        </h3>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">
          กรอกรหัส OTP ที่ส่งไปยังเบอร์ {formatThaiPhoneNumber(phoneNumber)}
        </p>
      </div>

      <div className="flex justify-between gap-2 px-2 md:gap-3" role="group" aria-labelledby="guest-otp-form-title">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className={`h-12 w-10 rounded-xl border text-center text-xl font-medium outline-none transition-all md:h-14 md:w-12 ${
              isError
                ? 'border-sop-system-error-400'
                : 'border-sop-neutral-grayalpha-200 focus:border-sop-primary-500 focus:ring-1 focus:ring-sop-primary-500'
            }`}
            aria-label={`รหัส OTP หลักที่ ${index + 1}`}
            aria-required="true"
            aria-invalid={isError}
            disabled={isLoading}
          />
        ))}
      </div>

      {isError ? (
        <p className="sop-body-sm-regular text-sop-system-error-400" role="alert" aria-live="polite">
          รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
        </p>
      ) : null}

      {timeLeft > 0 ? (
        <div className="sop-body-sm-regular text-left text-sop-neutral-gray-400">
          ไม่ได้รับรหัส OTP?{' '}
          <span aria-live="polite">
            ขอรหัสผ่านใหม่ใน 0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (isLoading) {
              return;
            }
            setTimeLeft(60);
            onResend();
          }}
          className="sop-body-sm-medium text-sop-primary-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          aria-label="ขอรับรหัส OTP ใหม่"
          aria-busy={isLoading}
        >
          {isLoading ? 'กำลังส่ง...' : 'ขอรับรหัส OTP ใหม่'}
        </button>
      )}
    </div>
  );
}
