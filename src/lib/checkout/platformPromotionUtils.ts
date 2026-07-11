import type { ActivePlatformPromotionsQuery } from '@/lib/graphql/generated/graphql';
import { formatCheckoutPrice } from '@/components/sections/CheckoutSection/checkoutOrderItemUtils';

export type PlatformPromotion = ActivePlatformPromotionsQuery['activePlatformPromotions'][number];

export type PlatformPromotionSelection = {
  code: string;
  name: string;
  discountAmount: number;
} | null;

export type PlatformPromotionModalSelection = { type: 'promo'; code: string } | { type: 'none' };

export function getInitialPlatformPromotionSelection(
  appliedPromotion: PlatformPromotionSelection,
): PlatformPromotionModalSelection {
  if (!appliedPromotion?.code) {
    return { type: 'none' };
  }

  return { type: 'promo', code: appliedPromotion.code };
}

export function formatPlatformPromotionAppliedDescription(discountAmount: number): string {
  if (discountAmount <= 0) {
    return 'ส่วนลดแพลตฟอร์ม';
  }

  return `ลดเพิ่ม ${formatCheckoutPrice(discountAmount)} ทั้งออเดอร์`;
}

export type PlatformPromotionSectionStage = 'active' | 'empty' | 'suggest';

export function getPlatformPromotionSectionStage(
  hasAppliedPromotion: boolean,
  availablePromotionCount: number,
): PlatformPromotionSectionStage {
  if (hasAppliedPromotion) return 'active';
  if (availablePromotionCount > 0) return 'suggest';
  return 'empty';
}

export function formatAvailablePromotionSuggestion(count: number): string {
  return `พบ ${count} ส่วนลดที่ใช้ได้`;
}
