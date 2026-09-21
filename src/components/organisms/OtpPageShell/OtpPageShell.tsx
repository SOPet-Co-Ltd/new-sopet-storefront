'use client';

import Image from 'next/image';
import { ArrowLeftIcon } from '@/components/atoms/icons';
import { cn } from '@/lib/utils';

const DESKTOP_SCENE = '/images/login/desktop_otp_request.webp';
const MOBILE_BANNER = '/images/login/mobile_otp_request.webp';

type OtpPageShellProps = {
  children: React.ReactNode;
  onBack: () => void;
  className?: string;
};

export function OtpPageShell({ children, onBack, className }: OtpPageShellProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-sop-primary-500',
        className,
      )}
      data-testid="otp-page-shell"
    >
      {/* Desktop: full-bleed decorative scene */}
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        <Image
          src={DESKTOP_SCENE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Mobile: top banner */}
      <div
        className="relative aspect-square w-full max-h-[375px] shrink-0 overflow-hidden md:hidden"
        aria-hidden="true"
      >
        <Image
          src={MOBILE_BANNER}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <button
        type="button"
        onClick={onBack}
        data-testid="otp-back-button"
        className={cn(
          'absolute left-[9px] top-5 z-20 inline-flex h-9 cursor-pointer items-center gap-2 rounded-sop-36',
          'md:left-10 md:top-10',
          'bg-sop-neutral-gray-500 px-sop-12px py-sop-8px shadow-xs',
          'sop-body-sm-medium text-sop-neutral-gray-200',
          'transition-opacity hover:opacity-90',
        )}
      >
        <ArrowLeftIcon size={{ mobile: 16, desktop: 16 }} />
        กลับ
      </button>

      {/* Mobile sheet: rounded top tucks slightly over the banner */}
      <div
        className={cn(
          'relative z-10 -mt-6 flex flex-1 flex-col items-center gap-6',
          'rounded-t-sop-24px bg-sop-base-white px-5 pt-10',
          'md:mt-0 md:justify-center md:bg-transparent md:px-10 md:pt-0',
        )}
      >
        <div
          className={cn(
            'flex w-full flex-col items-center gap-6',
            'md:w-[630px] md:rounded-[32px] md:bg-sop-neutral-whitealpha-600',
            'md:p-10 md:backdrop-blur-[8px]',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
