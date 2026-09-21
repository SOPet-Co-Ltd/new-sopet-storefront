'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { RefreshIcon } from '@/components/atoms/icons';
import { OtpCodeInput } from '@/components/atoms/OtpCodeInput/OtpCodeInput';
import { ReactivateAccountModal } from '@/components/molecules/ReactivateAccountModal/ReactivateAccountModal';
import { OtpPageShell } from '@/components/organisms/OtpPageShell/OtpPageShell';
import {
  clearOtpPhone,
  readOtpPhone,
  readOtpReferenceCode,
  storeOtpPhone,
} from '@/lib/auth/otpPhone';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLoginModal } from '@/lib/providers/LoginModalProvider';

const RESEND_COOLDOWN_SECONDS = 120;

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function OtpVerifyForm() {
  const router = useRouter();
  const { openLoginModal } = useLoginModal();
  const [phone, setPhone] = useState('');
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const { sendOtp, verifyOtp, pendingDeletion } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivationToken, setReactivationToken] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    const stored = readOtpPhone() ?? '';
    if (!stored) {
      router.replace('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate once from sessionStorage
    setPhone(stored);
    setReferenceCode(readOtpReferenceCode());
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleBack = () => {
    clearOtpPhone();
    openLoginModal();
    router.replace('/');
  };

  const handleVerify = async (otpCode: string) => {
    if (!/^\d{6}$/.test(otpCode) || !phone || verifyingRef.current || loading) return;

    verifyingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const result = await verifyOtp(phone, otpCode);

      if (result.pendingDeletion) {
        setReactivationToken(result.reactivationToken ?? null);
        setShowReactivateModal(true);
        return;
      }

      clearOtpPhone();
      router.replace('/');
    } catch (verifyError) {
      setError(getErrorMessage(verifyError, 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'));
      setCode('');
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleCodeChange = (next: string) => {
    setError(null);
    setCode(next);
    if (next.length === 6) {
      void handleVerify(next);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !phone) return;

    try {
      setResending(true);
      setError(null);
      const otpResult = await sendOtp(phone);
      storeOtpPhone(phone, otpResult.referenceCode);
      setReferenceCode(otpResult.referenceCode);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('ส่งรหัส OTP ใหม่แล้ว', {
        description: `ส่งไปที่ ${formatThaiPhoneNumber(phone)}`,
      });
    } catch (resendError) {
      setError(getErrorMessage(resendError, 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setResending(false);
    }
  };

  const resendDisabled = cooldown > 0 || resending || !phone;

  return (
    <>
      <OtpPageShell onBack={handleBack}>
        <div className="flex w-full flex-col items-center gap-6" data-testid="otp-verify-form">
          <div className="flex w-full flex-col items-center gap-1 text-center text-sop-neutral-gray-200">
            <h1 className="sop-headline-sm-medium">กรอกรหัสยืนยัน OTP</h1>
            <p className="sop-body-md-light">
              รหัสถูกส่งทาง SMS ไปยังเบอร์โทร {phone ? formatThaiPhoneNumber(phone) : '…'}
            </p>
            {referenceCode ? (
              <p className="sop-body-md-light" data-testid="otp-reference-code">
                รหัสอ้างอิง: {referenceCode}
              </p>
            ) : null}
          </div>

          <OtpCodeInput
            value={code}
            onChange={handleCodeChange}
            error={Boolean(error)}
            ariaDescribedBy={error ? 'otp-code-error' : undefined}
            disabled={loading}
            data-testid="otp-code-input"
          />

          {error ? (
            <p
              id="otp-code-error"
              role="alert"
              className="-mt-4 sop-body-xs-regular text-sop-system-error-400"
            >
              {error}
            </p>
          ) : null}

          <div className="flex w-full flex-col items-center gap-4">
            <p className="sop-body-md-light text-sop-neutral-gray-300">
              {cooldown > 0
                ? `ส่งใหม่อีกครั้งภายใน ${formatCooldown(cooldown)} น.`
                : 'สามารถส่งรหัสใหม่อีกครั้งได้แล้ว'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconLeft={<RefreshIcon size={{ mobile: 16, desktop: 16 }} />}
              disabled={resendDisabled}
              loading={resending}
              onClick={() => void handleResend()}
              className={cooldown > 0 ? 'opacity-40' : undefined}
              data-testid="otp-resend-button"
            >
              ส่งใหม่อีกครั้ง
            </Button>
          </div>
        </div>
      </OtpPageShell>

      <ReactivateAccountModal
        isOpen={showReactivateModal || pendingDeletion}
        reactivationToken={reactivationToken}
        onClose={() => setShowReactivateModal(false)}
        onSuccess={() => {
          clearOtpPhone();
          router.replace('/');
        }}
      />
    </>
  );
}
