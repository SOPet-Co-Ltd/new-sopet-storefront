'use client';

import { InfoIcon } from '@/components/atoms/icons/outline/InfoIcon';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

type CartSuspendedLinesRemovedBannerProps = {
  onDismiss?: () => void;
};

export function CartSuspendedLinesRemovedBanner({
  onDismiss,
}: CartSuspendedLinesRemovedBannerProps) {
  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-sop-12px bg-sop-system-warning-100 px-4 py-3"
      data-testid="cart-suspended-lines-removed-banner"
      role="status"
    >
      <InfoIcon size={{ mobile: 20 }} className="mt-0.5 shrink-0 text-sop-system-warning-500" />
      <p className="min-w-0 flex-1 sop-body-sm-regular text-sop-system-warning-500">
        {STORE_SUSPENSION_HOLD_COPY.cartInvalidatedBanner}
      </p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="sop-body-sm-medium text-sop-system-warning-500 underline"
          aria-label="ปิดการแจ้งเตือน"
        >
          ปิด
        </button>
      ) : null}
    </div>
  );
}
