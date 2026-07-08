'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { SOPetLogo } from '@/components/atoms/icons';
import { ReactivateAccountModal } from '@/components/molecules/ReactivateAccountModal/ReactivateAccountModal';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const { sendOtp, verifyOtp, pendingDeletion } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivationToken, setReactivationToken] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) {
      router.replace('/login');
    }
  }, [phone, router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending || !phone) return;

    try {
      setResending(true);
      setError(null);
      await sendOtp(phone);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('ส่งรหัส OTP ใหม่แล้ว', {
        description: `ส่งไปที่ ${formatThaiPhoneNumber(phone)}`,
      });
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await verifyOtp(phone, code);

      if (result.pendingDeletion) {
        setReactivationToken(result.reactivationToken ?? null);
        setShowReactivateModal(true);
        return;
      }

      router.replace('/');
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md" data-testid="otp-verify-form">
        <div className="flex justify-center">
          <Link href="/" aria-label="SOPet หน้าหลัก">
            <SOPetLogo size={{ mobile: 156, desktop: 256 }} />
          </Link>
        </div>

        <h1 className="mb-2 text-center sop-headline-sm-medium text-sop-neutral-gray-300">
          ยืนยันรหัส OTP
        </h1>
        <p className="mb-2 text-center sop-body-sm-regular text-sop-neutral-gray-400">
          ส่งรหัสไปที่ {formatThaiPhoneNumber(phone)}
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate>
          <Input
            title="รหัส OTP"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            variant="bordered"
            maxLength={6}
            state={error ? 'error' : 'default'}
            description={error ?? undefined}
            onChange={(event) => {
              setError(null);
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
            }}
          />

          <Button type="submit" size="lg" fill loading={loading} disabled={loading || !phone}>
            ยืนยัน
          </Button>

          <p className="text-center sop-body-sm-regular text-sop-neutral-gray-400">
            ไม่ได้รับรหัส?{' '}
            {cooldown > 0 ? (
              <span className="text-sop-neutral-gray-300">
                ขอรหัสใหม่อีกครั้งใน {cooldown} วินาที
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={resending}
                className="cursor-pointer font-medium text-sop-primary-500 underline underline-offset-2 hover:text-sop-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {resending ? 'กำลังส่ง...' : 'ขอรหัส OTP อีกครั้ง'}
              </button>
            )}
          </p>
        </form>
      </div>

      <ReactivateAccountModal
        isOpen={showReactivateModal || pendingDeletion}
        reactivationToken={reactivationToken}
        onClose={() => setShowReactivateModal(false)}
        onSuccess={() => router.replace('/')}
      />
    </>
  );
}
