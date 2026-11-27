'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { Toaster } from 'sonner';

const TOAST_WIDTH = 'min(364px, calc(100vw - 32px))';

type ToastTone = 'success' | 'warning' | 'error' | 'info';

const STATUS_ICON: Record<ToastTone, { src: string; background: string; glyph: number }> = {
  success: { src: '/images/toast/check.svg', background: 'bg-sop-system-success-400', glyph: 20 },
  warning: { src: '/images/toast/warning.svg', background: 'bg-sop-system-warning-300', glyph: 24 },
  error: { src: '/images/toast/error.svg', background: 'bg-sop-system-error-400', glyph: 20 },
  info: { src: '/images/toast/info.svg', background: 'bg-sop-system-info-400', glyph: 24 },
};

function StatusIcon({ type }: { type: ToastTone }) {
  const icon = STATUS_ICON[type];

  return (
    <span
      className={`relative block size-sop-20px shrink-0 overflow-hidden rounded-full ${icon.background}`}
    >
      <Image
        src={icon.src}
        alt=""
        width={icon.glyph}
        height={icon.glyph}
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: icon.glyph, height: icon.glyph }}
      />
    </span>
  );
}

function CloseIcon() {
  return (
    <Image
      src="/images/toast/close.svg"
      alt=""
      width={20}
      height={20}
      className="size-sop-20px max-w-none"
    />
  );
}

const toastIcons: Record<ToastTone | 'close', ReactNode> = {
  success: <StatusIcon type="success" />,
  warning: <StatusIcon type="warning" />,
  error: <StatusIcon type="error" />,
  info: <StatusIcon type="info" />,
  close: <CloseIcon />,
};

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      gap={12}
      visibleToasts={4}
      offset={16}
      mobileOffset={16}
      style={{ '--width': TOAST_WIDTH } as CSSProperties}
      icons={toastIcons}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: 'ปิด',
        classNames: {
          icon: 'order-1 mr-sop-8px flex shrink-0',
          content: 'order-2 flex min-w-0 flex-1 flex-col',
          title: 'sop-body-sm-medium text-sop-neutral-gray-200',
          description: 'sop-body-sm-regular text-sop-neutral-gray-200',
          closeButton:
            'order-3 flex size-sop-20px shrink-0 cursor-pointer items-center justify-center self-start border-0 bg-transparent p-0',
        },
      }}
    />
  );
}
