'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { RefreshIcon } from '@/components/atoms/icons';
import { Modal } from '@/components/atoms/Modal';
import { OtpCodeInput } from '@/components/atoms/OtpCodeInput/OtpCodeInput';
import { ReactivateAccountModal } from '@/components/molecules/ReactivateAccountModal/ReactivateAccountModal';
import { ERROR_CODES } from '@/lib/errors/errorCodes';
import { ERROR_MESSAGES } from '@/lib/errors/errorMessages';
import { extractErrorCode, getErrorMessage, isConnectionError } from '@/lib/errors/getErrorMessage';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

const RESEND_COOLDOWN_SECONDS = 120;
const OTP_TTL_SECONDS = 5 * 60;
const OTP_EXPIRED_MESSAGE = 'รหัส OTP หมดอายุแล้ว';

export type CheckoutExistingCustomerModalStep = 'prompt' | 'otp';

type CheckoutExistingCustomerModalProps = {
  open: boolean;
  phone: string;
  onClose: () => void;
  onLoginSuccess: () => void;
};

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function CheckoutExistingCustomerModalContent({
  phone,
  onClose,
  onLoginSuccess,
}: Omit<CheckoutExistingCustomerModalProps, 'open'>) {
  const { sendOtp, verifyOtp, pendingDeletion } = useAuth();
  const [step, setStep] = useState<CheckoutExistingCustomerModalStep>('prompt');
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpTtlRemaining, setOtpTtlRemaining] = useState(0);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivationToken, setReactivationToken] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (otpTtlRemaining <= 0) return;

    const timer = window.setInterval(() => {
      setOtpTtlRemaining((prev) => {
        if (prev <= 1) {
          setError(OTP_EXPIRED_MESSAGE);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpTtlRemaining]);

  const isOtpExpired = step === 'otp' && otpTtlRemaining <= 0 && referenceCode !== null;

  const handleRequestOtp = useCallback(async () => {
    if (!phone || sendingOtp) return;

    try {
      setSendingOtp(true);
      setError(null);
      const result = await sendOtp(phone);
      setReferenceCode(result.referenceCode);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtpTtlRemaining(OTP_TTL_SECONDS);
      setStep('otp');
    } catch (sendError) {
      setError(getErrorMessage(sendError, 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setSendingOtp(false);
    }
  }, [phone, sendOtp, sendingOtp]);

  const handleVerify = useCallback(
    async (otpCode: string) => {
      if (!/^\d{6}$/.test(otpCode) || !phone || verifyingRef.current || verifying) return;

      if (isOtpExpired) {
        setError(OTP_EXPIRED_MESSAGE);
        return;
      }

      verifyingRef.current = true;
      try {
        setVerifying(true);
        setError(null);
        const result = await verifyOtp(phone, otpCode);

        if (result.pendingDeletion) {
          setReactivationToken(result.reactivationToken ?? null);
          setShowReactivateModal(true);
          return;
        }

        onLoginSuccess();
      } catch (verifyError) {
        const errorCode = extractErrorCode(verifyError);
        if (errorCode === ERROR_CODES.OTP_EXPIRED) {
          setError(OTP_EXPIRED_MESSAGE);
        } else if (isConnectionError(verifyError)) {
          setError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
        } else {
          setError(getErrorMessage(verifyError, 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'));
        }
      } finally {
        setVerifying(false);
        verifyingRef.current = false;
      }
    },
    [isOtpExpired, onLoginSuccess, phone, verifyOtp, verifying],
  );

  const handleCodeChange = (next: string) => {
    if (!isOtpExpired) {
      setError(null);
    }
    setCode(next);
    if (next.length === 6) {
      void handleVerify(next);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !phone) return;

    try {
      setResending(true);
      if (!isOtpExpired) {
        setError(null);
      }
      const result = await sendOtp(phone);
      setReferenceCode(result.referenceCode);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtpTtlRemaining(OTP_TTL_SECONDS);
      setError(null);
    } catch (resendError) {
      if (isOtpExpired) {
        setError(OTP_EXPIRED_MESSAGE);
      } else {
        setError(getErrorMessage(resendError, 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'));
      }
    } finally {
      setResending(false);
    }
  };

  const formattedPhone = formatThaiPhoneNumber(phone);
  const isOtpStep = step === 'otp';
  const isWrongOtpError = Boolean(
    error && error !== OTP_EXPIRED_MESSAGE && error !== ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
  );

  return (
    <>
      <Modal
        onClose={onClose}
        width={isOtpStep ? 630 : 420}
        contentClassName="!px-0"
        data-testid="checkout-existing-customer-modal"
        aria-label={step === 'prompt' ? 'พบบัญชี Sopet' : 'ยืนยันรหัส OTP'}
      >
        {step === 'prompt' ? (
          <div
            className="flex flex-col items-center gap-sop-20px px-sop-32px pb-sop-24px pt-sop-32px"
            data-testid="checkout-existing-customer-prompt"
          >
            <div className="flex w-full flex-col items-center gap-sop-12px text-center">
              <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full">
                <Image
                  src="/images/checkout/existing-customer-mascot.webp"
                  alt=""
                  width={76}
                  height={76}
                  className="size-[76px] object-contain"
                  priority
                />
              </div>
              <div className="flex w-full flex-col gap-sop-4px text-center">
                <h2 className="sop-body-md-bold text-sop-neutral-gray-200">
                  ยินดีต้อนรับลูกค้า Sopet
                </h2>
                <p className="sop-body-sm-medium whitespace-pre-wrap text-sop-neutral-gray-300">
                  {`พบว่าเบอร์นี้มีบัญชีอยู่แล้ว `}
                  <br aria-hidden />
                  เข้าสู่ระบบเพื่อใช้ที่อยู่ที่บันทึกไว้ได้เลย
                </p>
              </div>
            </div>

            {error ? (
              <p role="alert" className="sop-body-xs-regular text-sop-system-error-400">
                {error}
              </p>
            ) : null}

            <div className="flex w-full flex-col gap-sop-8px">
              <Button
                type="button"
                variant="primary"
                size="xl"
                fill
                className="h-12 rounded-sop-36"
                loading={sendingOtp}
                onClick={() => void handleRequestOtp()}
                data-testid="checkout-existing-customer-login-otp"
              >
                เข้าสู่ระบบด้วย OTP
              </Button>
              <Button
                type="button"
                variant="neutral"
                size="xl"
                fill
                className="h-12 rounded-sop-36"
                disabled={sendingOtp}
                onClick={onClose}
                data-testid="checkout-existing-customer-continue-guest"
              >
                ซื้อต่อโดยไม่เข้าสู่ระบบ
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-sop-20px py-sop-32px"
            data-testid="checkout-existing-customer-otp"
          >
            <div className="flex w-full items-center justify-center gap-sop-8px px-sop-24px">
              <h2 className="sop-body-lg-medium text-center text-sop-neutral-gray-200">
                ยืนยันรหัส OTP
              </h2>
            </div>

            <div className="flex w-full flex-col items-center gap-sop-24px px-sop-24px">
              <div className="flex w-full flex-col items-center gap-sop-4px overflow-hidden text-center">
                <p className="sop-body-md-regular text-sop-neutral-gray-200">
                  รหัสถูกส่งไปที่เบอร์ {formattedPhone}
                </p>
                {referenceCode ? (
                  <p
                    className="sop-body-md-regular text-sop-neutral-gray-200"
                    data-testid="checkout-existing-customer-otp-reference"
                  >
                    รหัสอ้างอิง: {referenceCode}
                  </p>
                ) : null}
              </div>

              <OtpCodeInput
                value={code}
                onChange={handleCodeChange}
                size="compact"
                error={isWrongOtpError}
                ariaDescribedBy={error ? 'checkout-existing-customer-otp-error' : undefined}
                disabled={verifying}
                data-testid="checkout-existing-customer-otp-input"
              />

              <div className="flex w-full flex-col items-center gap-0">
                {error ? (
                  <p
                    id="checkout-existing-customer-otp-error"
                    role="alert"
                    className="sop-body-sm-regular text-center text-sop-system-error-400"
                  >
                    {error}
                  </p>
                ) : null}

                {cooldown > 0 ? (
                  <p className="sop-body-md-regular text-sop-neutral-gray-300">
                    ส่งรหัสใหม่ได้ใน {formatCooldown(cooldown)} น.
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={resending || !phone}
                    onClick={() => void handleResend()}
                    data-testid="checkout-existing-customer-otp-resend"
                    className={cn(
                      'inline-flex h-8 items-center justify-center gap-sop-8px px-sop-12px py-sop-8px sop-body-sm-medium text-sop-primary-500',
                      'cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
                    )}
                  >
                    <RefreshIcon size={{ mobile: 16, desktop: 16 }} color="currentColor" />
                    {resending ? 'กำลังส่ง…' : 'ส่งใหม่อีกครั้ง'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex w-full gap-sop-8px px-sop-24px">
              <Button
                type="button"
                variant="filled"
                size="xl"
                fill
                className="h-12 rounded-sop-36"
                disabled={verifying || resending}
                onClick={onClose}
                data-testid="checkout-existing-customer-otp-cancel"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ReactivateAccountModal
        isOpen={showReactivateModal || pendingDeletion}
        reactivationToken={reactivationToken}
        onClose={() => setShowReactivateModal(false)}
        onSuccess={() => {
          setShowReactivateModal(false);
          onLoginSuccess();
        }}
      />
    </>
  );
}

export function CheckoutExistingCustomerModal({
  open,
  phone,
  onClose,
  onLoginSuccess,
}: CheckoutExistingCustomerModalProps) {
  if (!open) {
    return null;
  }

  return (
    <CheckoutExistingCustomerModalContent
      phone={phone}
      onClose={onClose}
      onLoginSuccess={onLoginSuccess}
    />
  );
}
