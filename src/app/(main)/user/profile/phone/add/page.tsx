'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  ProfileContactEditLayout,
  ProfileFormActions,
} from '@/components/molecules/account/ProfileContactEditLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ThaiPhoneInput } from '@/components/molecules/ThaiPhoneInput';
import { FooterPhoneIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatThaiPhoneNumber, isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';

const PHONE_OTP_STEPS = ['กรอกเบอร์โทร', 'ยืนยัน OTP'] as const;

type Step = 'phone' | 'otp';

export default function AddPhonePage() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canRequestOtp = isValidThaiPhoneNumber(normalizeThaiPhoneNumber(phone));
  const canVerifyOtp = otp.trim().length >= 4;

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
      setOtp('');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งรหัส OTP ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canVerifyOtp) {
      setError('กรุณากรอกรหัส OTP ให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifyOtp(phone, otp.trim());
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'รหัส OTP ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      await sendOtp(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งรหัส OTP ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="เพิ่มเบอร์โทรศัพท์">
      <ProfileContactEditLayout
        icon={<FooterPhoneIcon />}
        description="ยืนยันเบอร์โทรศัพท์ด้วยรหัส OTP เพื่อใช้เข้าสู่ระบบและติดตามคำสั่งซื้อ"
        steps={{
          current: step === 'phone' ? 1 : 2,
          steps: PHONE_OTP_STEPS,
        }}
      >
        {step === 'phone' ? (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-4">
            <ThaiPhoneInput
              title="เบอร์โทรศัพท์"
              value={phone}
              onValueChange={(value) => {
                setPhone(value);
                if (error) setError(null);
              }}
              variant="bordered"
            />
            {error ? (
              <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
                {error}
              </p>
            ) : null}
            <ProfileFormActions
              submitLabel="รับรหัส OTP"
              loading={loading}
              disabled={!canRequestOtp}
            />
          </form>
        ) : (
          <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-4">
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">
              ส่งรหัสยืนยันไปที่{' '}
              <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                {formatThaiPhoneNumber(phone)}
              </span>
            </p>
            <Input
              title="รหัส OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                if (error) setError(null);
              }}
              variant="bordered"
            />
            {error ? (
              <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
                {error}
              </p>
            ) : null}
            <ProfileFormActions
              submitLabel="ยืนยันเบอร์โทร"
              loading={loading}
              disabled={!canVerifyOtp}
              secondaryAction={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    fill
                    disabled={loading}
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError(null);
                    }}
                  >
                    เปลี่ยนเบอร์โทร
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    fill
                    disabled={loading}
                    onClick={() => void handleResendOtp()}
                  >
                    ส่งรหัสใหม่
                  </Button>
                </div>
              }
            />
          </form>
        )}
      </ProfileContactEditLayout>
    </AccountLayout>
  );
}
