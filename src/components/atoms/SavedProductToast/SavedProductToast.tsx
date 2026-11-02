'use client';

import { toast } from 'sonner';

import { TickHeavyIcon } from '@/components/atoms/icons/filled/TickHeavyIcon';
import { XIcon } from '@/components/atoms/icons/inline/XIcon';

type SavedProductToastProps = {
  onClose: () => void;
};

export function SavedProductToast({ onClose }: SavedProductToastProps) {
  return (
    <div className="flex w-91 max-w-[calc(100vw-2rem)] items-center gap-sop-12px rounded-sop-12 border border-sop-system-success-200 bg-sop-system-success-100 px-sop-12px py-sop-12px shadow-[0_4px_16px_rgba(34,34,41,0.08)]">
      <span className="flex h-sop-24px w-sop-24px shrink-0 items-center justify-center rounded-full bg-sop-system-success-500 text-white">
        <TickHeavyIcon size={{ mobile: 14 }} color="#ffffff" />
      </span>
      <p className="sop-body-sm-regular text-sop-neutral-gray-200">บันทึกสินค้าแล้ว</p>
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="ml-auto flex shrink-0 cursor-pointer items-center justify-center text-sop-neutral-gray-400"
      >
        <XIcon size={{ mobile: 16 }} />
      </button>
    </div>
  );
}

export function showSavedProductToast() {
  toast.custom((id) => <SavedProductToast onClose={() => toast.dismiss(id)} />, {
    id: 'saved-product',
    position: 'top-right',
    duration: 4000,
  });
}
