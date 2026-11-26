'use client';

import { toast } from 'sonner';

import { TickHeavyIcon } from '@/components/atoms/icons/filled/TickHeavyIcon';
import { XIcon } from '@/components/atoms/icons/inline/XIcon';

export const CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE = 'เข้าสู่ระบบแล้ว ดึงที่อยู่เดิมให้แล้ว';

type CheckoutSavedAddressToastProps = {
  onClose: () => void;
};

export function CheckoutSavedAddressToast({ onClose }: CheckoutSavedAddressToastProps) {
  return (
    <div
      className="flex w-[340px] max-w-[calc(100vw-2rem)] items-start gap-sop-8px overflow-hidden rounded-sop-12 border border-sop-neutral-grayalpha-100 p-sop-12px shadow-[0_-8px_24px_-8px_rgba(34,34,41,0.08),0_20px_24px_-8px_rgba(34,34,41,0.08)]"
      style={{
        backgroundImage:
          'linear-gradient(125.5deg, rgba(84, 197, 112, 0.12) 0.53%, rgba(255, 255, 255, 0.12) 65%), linear-gradient(90deg, #ffffff 0%, #ffffff 100%)',
      }}
      data-testid="checkout-saved-address-toast"
    >
      <span className="flex h-sop-20px w-sop-20px shrink-0 items-center justify-center rounded-full bg-sop-system-success-400 text-white">
        <TickHeavyIcon size={{ mobile: 12 }} color="#ffffff" />
      </span>
      <p className="min-w-0 flex-1 sop-body-sm-medium whitespace-nowrap text-sop-neutral-gray-200">
        {CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE}
      </p>
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="flex h-sop-20px w-sop-20px shrink-0 cursor-pointer items-center justify-center text-sop-neutral-gray-400"
      >
        <XIcon size={{ mobile: 16 }} />
      </button>
    </div>
  );
}

export function showCheckoutSavedAddressToast() {
  toast.custom((toastId) => <CheckoutSavedAddressToast onClose={() => toast.dismiss(toastId)} />, {
    id: 'checkout-saved-address',
    position: 'top-right',
    duration: 4000,
    unstyled: true,
  });
}
