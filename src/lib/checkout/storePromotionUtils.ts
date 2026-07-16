import type { ActiveStorePromotionsQuery } from '@/lib/graphql/generated/graphql';
import { formatCheckoutPrice } from '@/components/sections/CheckoutSection/checkoutOrderItemUtils';

export type StorePromotion = ActiveStorePromotionsQuery['activeStorePromotions'][number];

export type StorePromotionSelection = {
  code: string;
  name: string;
  discountAmount: number;
} | null;

export type StorePromotionModalSelection = { type: 'promo'; code: string } | { type: 'none' };

export type PromotionAvailabilityContext = {
  /** When true, promotions with newCustomer.enabled are unavailable (GUEST_REQUIRED). */
  isGuest?: boolean;
};

export type UnavailablePromotionReason = 'GUEST_REQUIRED' | 'MIN_PURCHASE' | 'UNKNOWN';

export type ParsedStorePromotionConditions = {
  newCustomer?: { enabled: true; nDays: number };
};

const GUEST_REQUIRED_WARNING = 'โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก';
const GUEST_REQUIRED_CTA_LABEL = 'เข้าสู่ระบบ';
const GUEST_REQUIRED_CTA_HREF = '/login';
const MIN_PURCHASE_CTA_LABEL = 'ช้อปเพิ่ม';
const MIN_PURCHASE_CTA_HREF = '/cart';
const UNKNOWN_UNAVAILABLE_WARNING = 'ยังใช้โปรโมชันนี้ไม่ได้ในขณะนี้';

/**
 * Parse GraphQL `conditions: String` (ADR camelCase JSON).
 * Missing / invalid → gates off (empty object).
 */
export function parseStorePromotionConditions(
  conditions: string | null | undefined,
): ParsedStorePromotionConditions {
  if (!conditions) return {};

  try {
    const parsed: unknown = JSON.parse(conditions);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const record = parsed as Record<string, unknown>;
    const newCustomerRaw = record.newCustomer;
    if (
      typeof newCustomerRaw === 'object' &&
      newCustomerRaw !== null &&
      !Array.isArray(newCustomerRaw) &&
      (newCustomerRaw as Record<string, unknown>).enabled === true &&
      typeof (newCustomerRaw as Record<string, unknown>).nDays === 'number'
    ) {
      return {
        newCustomer: {
          enabled: true,
          nDays: (newCustomerRaw as { nDays: number }).nDays,
        },
      };
    }

    return {};
  } catch {
    return {};
  }
}

export function hasNewCustomerConditionEnabled(promotion: StorePromotion): boolean {
  return parseStorePromotionConditions(promotion.conditions).newCustomer?.enabled === true;
}

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

export function isPromotionAvailable(
  promotion: StorePromotion,
  storeSubtotal: number,
  context?: PromotionAvailabilityContext,
): boolean {
  if (context?.isGuest && hasNewCustomerConditionEnabled(promotion)) {
    return false;
  }

  const minPurchase = promotion.minPurchaseAmount ?? 0;
  return storeSubtotal >= minPurchase;
}

export function categorizeStorePromotions(
  promotions: StorePromotion[],
  storeSubtotal: number,
  context?: PromotionAvailabilityContext,
): {
  available: StorePromotion[];
  unavailable: StorePromotion[];
} {
  const available: StorePromotion[] = [];
  const unavailable: StorePromotion[] = [];

  for (const promotion of promotions) {
    if (isPromotionAvailable(promotion, storeSubtotal, context)) {
      available.push(promotion);
    } else {
      unavailable.push(promotion);
    }
  }

  return { available, unavailable };
}

/**
 * Prefer specific soft reason when known (UI Spec UnavailableStorePromotionCard).
 * Guest + newCustomer wins over min-purchase.
 */
export function getUnavailablePromotionReason(
  promotion: StorePromotion,
  storeSubtotal: number,
  context?: PromotionAvailabilityContext,
): UnavailablePromotionReason {
  if (context?.isGuest && hasNewCustomerConditionEnabled(promotion)) {
    return 'GUEST_REQUIRED';
  }

  const minPurchase = promotion.minPurchaseAmount ?? 0;
  if (minPurchase > 0 && storeSubtotal < minPurchase) {
    return 'MIN_PURCHASE';
  }

  return 'UNKNOWN';
}

export function getUnavailablePromotionWarning(
  reason: UnavailablePromotionReason,
  promotion: StorePromotion,
  storeSubtotal: number,
): string | null {
  switch (reason) {
    case 'GUEST_REQUIRED':
      return GUEST_REQUIRED_WARNING;
    case 'MIN_PURCHASE': {
      const minPurchase = promotion.minPurchaseAmount ?? 0;
      const remaining = Math.max(minPurchase - storeSubtotal, 0);
      if (remaining > 0) {
        return `ซื้อเพิ่มอีก ${formatCheckoutPrice(remaining)} เพื่อใช้ส่วนลดนี้`;
      }
      return formatPromotionConditionText(promotion, storeSubtotal);
    }
    case 'UNKNOWN':
    default:
      return formatPromotionConditionText(promotion, storeSubtotal) ?? UNKNOWN_UNAVAILABLE_WARNING;
  }
}

export function getUnavailablePromotionCta(
  reason: UnavailablePromotionReason,
): { label: string; href: string } | null {
  switch (reason) {
    case 'GUEST_REQUIRED':
      return { label: GUEST_REQUIRED_CTA_LABEL, href: GUEST_REQUIRED_CTA_HREF };
    case 'MIN_PURCHASE':
      return { label: MIN_PURCHASE_CTA_LABEL, href: MIN_PURCHASE_CTA_HREF };
    case 'UNKNOWN':
    default:
      return null;
  }
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
