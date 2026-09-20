'use client';

import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { XIcon } from '@/components/atoms/icons/inline/XIcon';
import { NOTICE_MESSAGES, type LoginNotice } from '@/components/molecules/LoginForm/LoginForm';
import { ThaiPhoneInput } from '@/components/molecules/ThaiPhoneInput/ThaiPhoneInput';
import { storeOtpPhone } from '@/lib/auth/otpPhone';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import { LoginPageImagesDocument } from '@/lib/graphql/generated/graphql';
import { isValidThaiPhoneNumber, normalizeThaiPhoneNumber } from '@/lib/helpers/phone';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLoginModal } from '@/lib/providers/LoginModalProvider';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function LoginImagePanel({
  imageUrl,
  altText,
  className,
}: {
  imageUrl: string | null | undefined;
  altText: string | null | undefined;
  className?: string;
}) {
  const alt = altText?.trim() || 'SOPet login';

  if (!imageUrl) {
    return (
      <div
        className={cn('h-full w-full bg-sop-primary-500', className)}
        aria-hidden="true"
        data-testid="login-modal-image-fallback"
      />
    );
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 767px) 100vw, 50vw"
        className="object-cover"
        priority
      />
    </div>
  );
}

function LoginPhoneForm({ notice, onSuccess }: { notice: LoginNotice; onSuccess: () => void }) {
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
      storeOtpPhone(normalizedPhone);
      onSuccess();
      router.push('/login/otp');
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col" data-testid="login-modal-form">
      <h2 className="text-center sop-headline-sm-medium text-sop-neutral-gray-300 md:text-left">
        ยินดีต้อนรับสู่ SOPet
      </h2>
      <p className="mt-2 text-center sop-body-sm-regular text-sop-neutral-gray-400 md:text-left">
        สมัครเลยวันนี้ รับโปรโมชันสุดพิเศษสำหรับคุณ
      </p>

      {notice && (
        <p role="alert" className="mt-4 sop-body-sm-regular text-sop-system-error-400">
          {NOTICE_MESSAGES[notice]}
        </p>
      )}

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <ThaiPhoneInput
          placeholder="กรอกเบอร์โทรศัพท์"
          value={phone}
          variant="flat"
          aria-label="เบอร์โทรศัพท์"
          state={error ? 'error' : 'default'}
          description={error ?? undefined}
          onValueChange={(value) => {
            setError(null);
            setPhone(value);
          }}
        />

        <Button type="submit" size="lg" fill loading={loading} disabled={loading}>
          ดำเนินการต่อ
        </Button>
      </form>
    </div>
  );
}

export function LoginModal() {
  const { isOpen, notice, closeLoginModal } = useLoginModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const { data } = useQuery(LoginPageImagesDocument, {
    skip: !isOpen,
  });

  const images = data?.loginPageImages;
  const desktopImageUrl = images?.desktopImageUrl ?? null;
  const mobileImageUrl = images?.mobileImageUrl ?? desktopImageUrl;
  const altText = images?.altText ?? null;

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLoginModal();
    },
    [closeLoginModal],
  );

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);
    document.body.style.overflow = 'hidden';

    const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable && focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    } else {
      dialogRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = '';

      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape, handleTabKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:px-16 md:pb-4 md:pt-16">
      <div
        className="absolute inset-0 bg-sop-neutral-whitealpha-400 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="เข้าสู่ระบบ"
        tabIndex={-1}
        data-testid="login-modal"
        className="relative h-dvh w-full md:h-[min(90vh,calc((100vw-8rem)/2))] md:w-[min(calc(100vw-8rem),calc(90vh*2))]"
      >
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="ปิด"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-sop-base-white shadow-lg md:right-0 md:-top-14"
        >
          <XIcon size={{ mobile: 18 }} color="#454547" />
        </button>

        <div className="flex h-full w-full flex-col overflow-hidden bg-sop-base-white md:flex-row md:rounded-sop-24 md:shadow-lg">
          {/* Mobile image */}
          <div className="relative h-[42%] min-h-[200px] w-full shrink-0 md:hidden">
            <LoginImagePanel imageUrl={mobileImageUrl} altText={altText} />
          </div>

          {/* Desktop image */}
          <div className="relative hidden h-full w-1/2 shrink-0 md:block">
            <LoginImagePanel imageUrl={desktopImageUrl} altText={altText} />
          </div>

          <div className="relative -mt-6 flex flex-1 flex-col rounded-t-sop-24 bg-sop-base-white px-6 pb-8 pt-8 md:mt-0 md:w-1/2 md:flex-none md:justify-center md:rounded-none md:px-10 md:py-8">
            <LoginPhoneForm notice={notice} onSuccess={closeLoginModal} />
          </div>
        </div>
      </div>
    </div>
  );
}
