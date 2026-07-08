'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatThaiPhoneNumber, isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';

type Step = 'phone' | 'otp';

export default function ChangePhonePage() {
  const router = useRouter();
  const { customer, sendOtp, changeCustomerPhone } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeThaiPhoneNumber(phone);
    if (!isValidThaiPhoneNumber(normalized)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendOtp(normalized);
      setPhone(normalized);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งรหัส OTP ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.trim().length < 4) {
      setError('กรุณากรอกรหัส OTP ให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await changeCustomerPhone(phone, otp.trim());
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'รหัส OTP ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="เปลี่ยนเบอร์โทรศัพท์">
      <div className="max-w-md space-y-4">
        {customer?.phone ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">
            เบอร์ปัจจุบัน: {formatThaiPhoneNumber(customer.phone)}
          </p>
        ) : null}

        {step === 'phone' ? (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-4">
            <Input
              title="เบอร์โทรศัพท์ใหม่"
              type="tel"
              inputMode="tel"
              placeholder="0812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error ? (
              <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
                {error}
              </p>
            ) : null}
            <Button type="submit" fill loading={loading} disabled={loading}>
              รับรหัส OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-4">
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">
              ส่งรหัสไปที่ {formatThaiPhoneNumber(phone)}
            </p>
            <Input
              title="รหัส OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error ? (
              <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
                {error}
              </p>
            ) : null}
            <Button type="submit" fill loading={loading} disabled={loading}>
              ยืนยัน
            </Button>
          </form>
        )}
      </div>
    </AccountLayout>
  );
}
