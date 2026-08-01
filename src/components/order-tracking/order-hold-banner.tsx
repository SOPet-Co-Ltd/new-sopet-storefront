import { InfoIcon } from '@/components/atoms/icons/outline/InfoIcon';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';
import type { HoldBannerVariant } from '@/lib/order-tracking/holdVisibility';

type OrderHoldBannerProps = {
  variant: Exclude<HoldBannerVariant, null>;
};

export function OrderHoldBanner({ variant }: OrderHoldBannerProps) {
  const message =
    variant === 'full'
      ? STORE_SUSPENSION_HOLD_COPY.holdBannerFull
      : STORE_SUSPENSION_HOLD_COPY.holdBannerMixed;

  return (
    <div
      className="flex items-start gap-3 rounded-sop-12px bg-sop-system-warning-100 px-4 py-3"
      data-testid="order-hold-banner"
      data-variant={variant}
      role="status"
    >
      <InfoIcon size={{ mobile: 20 }} className="mt-0.5 shrink-0 text-sop-system-warning-500" />
      <p className="sop-body-sm-regular text-sop-system-warning-500">{message}</p>
    </div>
  );
}
