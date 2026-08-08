import { TimeIcon } from '@/components/atoms/icons/filled/TimeIcon';
import { usePaymentCountdown } from '@/lib/hooks/usePaymentCountdown';

type ProductFlashSaleStripProps = {
  discountPercent: number;
  /** Campaign expiry; when present drives a live countdown. */
  expiresAt?: string | null;
  /** Sale campaign name from vendor; falls back to “Flash Sale”. */
  campaignName?: string | null;
};

const OPEN_ENDED_COUNTDOWN_LABEL = 'ตลอดแคมเปญ';
const FALLBACK_CAMPAIGN_TITLE = 'Flash Sale';

/**
 * Under 24h → `HH:MM:SS`.
 * 24h+ → `N วัน HH:MM:SS` (hours wrap within the day, not total hours).
 */
export function formatFlashSaleCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hms = [hours, minutes, seconds].map((unit) => String(unit).padStart(2, '0')).join(':');

  if (days > 0) {
    return `${days} วัน ${hms}`;
  }

  return hms;
}

export function formatFlashSaleTitle(
  discountPercent: number,
  campaignName?: string | null,
): string {
  const title = campaignName?.trim() || FALLBACK_CAMPAIGN_TITLE;
  return `${title} · ถูกกว่าเดิม ${discountPercent}%`;
}

export function formatFlashSaleCountdownLabel(
  remainingMs: number | null,
  expiresAt?: string | null,
): string {
  if (remainingMs != null) {
    return formatFlashSaleCountdown(remainingMs);
  }
  // No end date on the campaign — avoid a fake HH:MM:SS fallback.
  if (!expiresAt) {
    return OPEN_ENDED_COUNTDOWN_LABEL;
  }
  return formatFlashSaleCountdown(0);
}

export function ProductFlashSaleStrip({
  discountPercent,
  expiresAt,
  campaignName,
}: ProductFlashSaleStripProps) {
  const { remainingMs } = usePaymentCountdown(expiresAt);
  const countdownLabel = formatFlashSaleCountdownLabel(remainingMs, expiresAt);
  const titleLabel = formatFlashSaleTitle(discountPercent, campaignName);

  return (
    <div
      className="mt-3 flex items-center justify-between gap-3 rounded-sop-8px bg-sop-primary-500 px-3 py-2"
      data-testid="product-flash-sale-strip"
    >
      <span className="sop-body-xs-regular md:sop-body-sm-regular line-clamp-1 text-sop-base-white">
        {titleLabel}
      </span>
      <div className="flex shrink-0 items-center gap-1.5 text-sop-base-white">
        <TimeIcon size={{ mobile: 14, desktop: 16 }} color="#FFFFFF" />
        <span className="sop-body-xs-regular md:sop-body-sm-regular tabular-nums">
          {countdownLabel}
        </span>
      </div>
    </div>
  );
}
