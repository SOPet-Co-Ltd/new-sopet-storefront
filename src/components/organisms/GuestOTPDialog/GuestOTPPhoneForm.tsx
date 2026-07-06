'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';

type GuestOTPPhoneFormProps = {
  initialPhone?: string;
  onSubmit: (phone: string) => void;
  isLoading?: boolean;
};

export function GuestOTPPhoneForm({
  initialPhone = '',
  onSubmit,
  isLoading = false,
}: GuestOTPPhoneFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = normalizeThaiPhoneNumber(phoneNumber);

    if (!isValidThaiPhoneNumber(normalizedPhone)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    setError('');
    onSubmit(normalizedPhone);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6 mx-auto">
      <div className="space-y-2 text-left">
        <h3 className="sop-headline-sm-medium text-sop-neutral-gray-200" id="guest-phone-form-title">
          กรอกเบอร์มือถือของคุณ
        </h3>
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">
          เพื่อรับรหัส OTP สำหรับยืนยันเบอร์มือถือ
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6"
        noValidate
        aria-labelledby="guest-phone-form-title"
      >
        <div>
          <Input
            title="เบอร์มือถือ"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812345678"
            value={phoneNumber}
            onChange={(event) => {
              setPhoneNumber(event.target.value);
              setError('');
            }}
            disabled={isLoading}
          />
          {error ? (
            <p
              id="guest-phone-error"
              className="mt-2 sop-body-sm-regular text-sop-system-error-400"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          fill
          loading={isLoading}
          disabled={!isValidThaiPhoneNumber(normalizeThaiPhoneNumber(phoneNumber)) || isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'กำลังส่ง...' : 'ขอรหัส OTP'}
        </Button>
      </form>
    </div>
  );
}
