'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { SOPetLogo } from '@/components/atoms/icons';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';

export type LoginNotice = 'sessionRequired' | 'sessionExpired' | null;

const NOTICE_MESSAGES: Record<Exclude<LoginNotice, null>, string> = {
  sessionRequired: 'กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้',
  sessionExpired: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
};

type LoginFormProps = {
  notice?: LoginNotice;
};

export function LoginForm({ notice = null }: LoginFormProps) {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedPhone = normalizeThaiPhoneNumber(phone);
    if (!isValidThaiPhoneNumber(normalizedPhone)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendOtp(normalizedPhone);
      router.push(`/login/otp?phone=${encodeURIComponent(normalizedPhone)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md" data-testid="login-form">
      <div className="mb-8 flex justify-center">
        <Link href="/" aria-label="SOPet หน้าหลัก">
          <SOPetLogo size={{ mobile: 56, desktop: 56 }} />
        </Link>
      </div>

      <h1 className="mb-2 text-center sop-headline-sm-medium text-sop-neutral-gray-300">
        เข้าสู่ระบบ
      </h1>
      <p className="mb-6 text-center sop-body-sm-regular text-sop-neutral-gray-400">
        กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP
      </p>

      {notice && (
        <p role="alert" className="mb-4 sop-body-sm-regular text-sop-system-error-400">
          {NOTICE_MESSAGES[notice]}
        </p>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Input
          title="เบอร์โทรศัพท์"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0812345678"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        {error && (
          <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
            {error}
          </p>
        )}

        <Button type="submit" fill loading={loading} disabled={loading}>
          รับรหัส OTP
        </Button>
      </form>
    </div>
  );
}
