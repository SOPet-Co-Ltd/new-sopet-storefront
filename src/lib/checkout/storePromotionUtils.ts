import type { ActiveStorePromotionsQuery } from '@/lib/graphql/generated/graphql';
import { formatCheckoutPrice } from '@/components/sections/CheckoutSection/checkoutOrderItemUtils';

export type StorePromotion = ActiveStorePromotionsQuery['activeStorePromotions'][number];

export type StorePromotionSelection = {
  code: string;
  name: string;
  discountAmount: number;
} | null;

export type StorePromotionModalSelection = { type: 'promo'; code: string } | { type: 'none' };

export function formatPromotionDiscountTitle(promotion: StorePromotion): string {
  if (promotion.type === 'percentage') {
    return `ส่วนลด ${promotion.discountValue}%`;
  }

  return `ส่วนลด ${formatCheckoutPrice(promotion.discountValue)}`;
}

export function formatPromotionConditionText(
  promotion: StorePromotion,
  storeSubtotal: number,
): string | null {
  const minPurchase = promotion.minPurchaseAmount;
  const maxDiscount = promotion.maxDiscountAmount;
  const hasMinPurchase = minPurchase != null && minPurchase > 0;
  const hasMaxDiscount = maxDiscount != null && promotion.type === 'percentage';

  if (!hasMinPurchase && !hasMaxDiscount) {
    return null;
  }

  if (hasMinPurchase && storeSubtotal < minPurchase) {
    const remaining = minPurchase - storeSubtotal;
    return `ซื้อเพิ่มอีก ${formatCheckoutPrice(remaining)} เพื่อใช้ส่วนลดนี้`;
  }

  if (hasMaxDiscount && hasMinPurchase) {
    return `เมื่อซื้อครบ ${formatCheckoutPrice(minPurchase)} ลดสูงสุด ${formatCheckoutPrice(maxDiscount)}`;
  }

  if (hasMaxDiscount) {
    return `ลดสูงสุด ${formatCheckoutPrice(maxDiscount)}`;
  }

  if (hasMinPurchase) {
    return `เมื่อซื้อครบ ${formatCheckoutPrice(minPurchase)}`;
  }

  return null;
}

export function formatPromotionExpiry(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  const buddhistYear = (date.getFullYear() + 543) % 100;
  const formatted = date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });

  return `หมดอายุ ${formatted} ${buddhistYear.toString().padStart(2, '0')}`;
}

export function estimatePromotionDiscount(
  promotion: StorePromotion,
  storeSubtotal: number,
): number {
  let discountAmount = 0;

  if (promotion.type === 'percentage') {
    discountAmount = (storeSubtotal * promotion.discountValue) / 100;
  } else if (promotion.type === 'fixed_amount') {
    discountAmount = promotion.discountValue;
  }

  if (promotion.maxDiscountAmount != null) {
    discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
  }

  return Math.min(discountAmount, storeSubtotal);
}

export function isPromotionAvailable(promotion: StorePromotion, storeSubtotal: number): boolean {
  const minPurchase = promotion.minPurchaseAmount ?? 0;
  return storeSubtotal >= minPurchase;
}

export function categorizeStorePromotions(
  promotions: StorePromotion[],
  storeSubtotal: number,
): {
  available: StorePromotion[];
  unavailable: StorePromotion[];
} {
  const available: StorePromotion[] = [];
  const unavailable: StorePromotion[] = [];

  for (const promotion of promotions) {
    if (isPromotionAvailable(promotion, storeSubtotal)) {
      available.push(promotion);
    } else {
      unavailable.push(promotion);
    }
  }

  return { available, unavailable };
}

export function getInitialStorePromotionSelection(
  appliedPromotion: StorePromotionSelection,
): StorePromotionModalSelection {
  if (!appliedPromotion?.code) {
    return { type: 'none' };
  }

  return { type: 'promo', code: appliedPromotion.code };
}

export function formatStorePromotionDiscountLabel(amount: number): string {
  if (amount <= 0) {
    return '฿0';
  }

  return `- ${formatCheckoutPrice(amount)}`;
}

export function formatUnavailablePromotionDiscountTitle(promotion: StorePromotion): string {
  const discount = formatPromotionDiscountTitle(promotion);
  const minPurchase = promotion.minPurchaseAmount ?? 0;

  if (minPurchase <= 0) {
    return discount;
  }

  return `${discount} (เมื่อครบ ${formatCheckoutPrice(minPurchase)})`;
}
