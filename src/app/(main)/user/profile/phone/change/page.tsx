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

export default function ChangePhonePage() {
  const router = useRouter();
  const { customer, sendOtp, changeCustomerPhone } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhone = normalizeThaiPhoneNumber(phone);
  const currentPhone = customer?.phone ? normalizeThaiPhoneNumber(customer.phone) : '';
  const isSameAsCurrentPhone =
    Boolean(currentPhone) &&
    isValidThaiPhoneNumber(normalizedPhone) &&
    normalizedPhone === currentPhone;
  const canRequestOtp = isValidThaiPhoneNumber(normalizedPhone) && !isSameAsCurrentPhone;
  const canVerifyOtp = otp.trim().length >= 4;

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRequestOtp) {
      setError(
        isSameAsCurrentPhone
          ? 'เบอร์โทรศัพท์ใหม่ต้องไม่ซ้ำกับเบอร์ปัจจุบัน'
          : 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendOtp(normalizedPhone);
      setPhone(normalizedPhone);
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
      await changeCustomerPhone(phone, otp.trim());
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
    <AccountLayout title="เปลี่ยนเบอร์โทรศัพท์">
      <ProfileContactEditLayout
        icon={<FooterPhoneIcon />}
        description="เบอร์โทรศัพท์ใหม่จะใช้สำหรับการเข้าสู่ระบบและรับการแจ้งเตือนคำสั่งซื้อ"
        currentValue={
          customer?.phone
            ? {
                label: 'เบอร์ปัจจุบัน',
                value: formatThaiPhoneNumber(customer.phone),
              }
            : undefined
        }
        steps={{
          current: step === 'phone' ? 1 : 2,
          steps: PHONE_OTP_STEPS,
        }}
      >
        {step === 'phone' ? (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-4">
            <ThaiPhoneInput
              title="เบอร์โทรศัพท์ใหม่"
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
              submitLabel="ยืนยันเบอร์โทรใหม่"
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
