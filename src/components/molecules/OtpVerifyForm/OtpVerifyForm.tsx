'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { SOPetLogo } from '@/components/atoms/icons';
import { ReactivateAccountModal } from '@/components/molecules/ReactivateAccountModal/ReactivateAccountModal';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';

export function OtpVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const { verifyOtp, pendingDeletion } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivationToken, setReactivationToken] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) {
      router.replace('/login');
    }
  }, [phone, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (code.trim().length < 4) {
      setError('กรุณากรอกรหัส OTP ให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await verifyOtp(phone, code.trim());

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
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="SOPet หน้าหลัก">
            <SOPetLogo size={{ mobile: 56, desktop: 56 }} />
          </Link>
        </div>

        <h1 className="mb-2 text-center sop-headline-sm-medium text-sop-neutral-gray-300">
          ยืนยันรหัส OTP
        </h1>
        <p className="mb-6 text-center sop-body-sm-regular text-sop-neutral-gray-400">
          ส่งรหัสไปที่ {formatThaiPhoneNumber(phone)}
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <Input
            title="รหัส OTP"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          {error && (
            <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
              {error}
            </p>
          )}

          <Button type="submit" fill loading={loading} disabled={loading || !phone}>
            ยืนยัน
          </Button>
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
