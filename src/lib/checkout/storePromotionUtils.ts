import type { ActiveStorePromotionsQuery } from '@/lib/graphql/generated/graphql';
import { formatCheckoutPrice } from '@/components/sections/CheckoutSection/checkoutOrderItemUtils';

export type StorePromotion = ActiveStorePromotionsQuery['activeStorePromotions'][number];

export type StorePromotionSelection = {
  code: string;
  name: string;
  discountAmount: number;
  /** Server validatePromotion.freeUnits only — Gate A line badges (task-09). */
  freeUnits?: number | null;
  /** BxGy product P for Gate A free-unit line allocation (from conditions). */
  productId?: string | null;
} | null;

export type StorePromotionModalSelection = { type: 'promo'; code: string } | { type: 'none' };

/** Cart line shape for client BxGy Rule A/B preview (mirrors validatePromotion lines). */
export type PromotionEstimateCartLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
  variantId?: string;
};

export type PromotionAvailabilityContext = {
  /** When true, promotions with loggedInOnly or newCustomer.enabled are unavailable (GUEST_REQUIRED). */
  isGuest?: boolean;
  /** Cart lines for BxGy Rule A qty check (same shape as estimate). */
  cartLines?: PromotionEstimateCartLine[];
};

export type UnavailablePromotionReason =
  'GUEST_REQUIRED' | 'NOT_NEW_CUSTOMER' | 'MIN_PURCHASE' | 'BXGY_QTY' | 'UNKNOWN';

/** Customer-facing soft reason after validatePromotion ineligibility collapse. */
export type SoftCustomerReason = UnavailablePromotionReason;

export type ParsedStorePromotionConditions = {
  loggedInOnly?: { enabled: true };
  newCustomer?: { enabled: true; nDays: number };
  productId?: string;
  buyQuantity?: number;
  getQuantity?: number;
};

const GUEST_REQUIRED_WARNING = 'โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก';
const GUEST_REQUIRED_CTA_LABEL = 'เข้าสู่ระบบ';
const GUEST_REQUIRED_CTA_HREF = '/login';
const NOT_NEW_CUSTOMER_WARNING = 'โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น';
const BXGY_QTY_WARNING = 'เพิ่มสินค้าในโปรให้ครบเงื่อนไขซื้อแถม';
const MIN_PURCHASE_CTA_LABEL = 'ช้อปเพิ่ม';
const MIN_PURCHASE_CTA_HREF = '/cart';
const UNKNOWN_UNAVAILABLE_WARNING = 'ยังใช้โปรโมชันนี้ไม่ได้ในขณะนี้';

const RULE_H_CUSTOMER_REASONS = new Set<SoftCustomerReason>([
  'GUEST_REQUIRED',
  'NOT_NEW_CUSTOMER',
  'MIN_PURCHASE',
  'BXGY_QTY',
  'UNKNOWN',
]);

/**
 * Collapse validatePromotion / batch `ineligibilityReason` → UI Spec customer reason.
 * Scope: soft UX only — do not reuse for createOrder classification.
 * Conflict-001: `PROMOTION_MIN_PURCHASE` → `MIN_PURCHASE` (preserve ช้อปเพิ่ม CTA).
 * UI-D-007: Rule H family strings already in the union pass through unchanged.
 */
export function mapSoftIneligibilityReason(
  ineligibilityReason: string | null | undefined,
): SoftCustomerReason {
  if (
    ineligibilityReason != null &&
    RULE_H_CUSTOMER_REASONS.has(ineligibilityReason as SoftCustomerReason)
  ) {
    return ineligibilityReason as SoftCustomerReason;
  }

  switch (ineligibilityReason) {
    case 'GUEST':
      return 'GUEST_REQUIRED';
    case 'ORDER_HISTORY':
    case 'ACCOUNT_AGE':
      return 'NOT_NEW_CUSTOMER';
    case 'INSUFFICIENT_QTY':
    case 'MISSING_LINES':
      return 'BXGY_QTY';
    case 'PROMOTION_MIN_PURCHASE':
      return 'MIN_PURCHASE';
    default:
      return 'UNKNOWN';
  }
}

/** Batch list-time eligibility item (Decision 6 / fixture shape before codegen). */
export type PromotionEligibilityBatchItem = {
  id?: string | null;
  code?: string | null;
  eligible: boolean;
  ineligibilityReason?: string | null;
};

export type ListTimeBatchStatus = 'idle' | 'loading' | 'success' | 'error';

export type UnavailableStorePromotionEntry = {
  promotion: StorePromotion;
  softReasonOverride?: UnavailablePromotionReason;
};

export type MergedListTimeEligibility = {
  available: StorePromotion[];
  unavailable: UnavailableStorePromotionEntry[];
  softEligibilityError: boolean;
};

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
    const result: ParsedStorePromotionConditions = {};

    const loggedInOnlyRaw = record.loggedInOnly;
    if (
      typeof loggedInOnlyRaw === 'object' &&
      loggedInOnlyRaw !== null &&
      !Array.isArray(loggedInOnlyRaw) &&
      (loggedInOnlyRaw as Record<string, unknown>).enabled === true
    ) {
      result.loggedInOnly = { enabled: true };
    }

    const newCustomerRaw = record.newCustomer;
    if (
      typeof newCustomerRaw === 'object' &&
      newCustomerRaw !== null &&
      !Array.isArray(newCustomerRaw) &&
      (newCustomerRaw as Record<string, unknown>).enabled === true &&
      typeof (newCustomerRaw as Record<string, unknown>).nDays === 'number'
    ) {
      result.newCustomer = {
        enabled: true,
        nDays: (newCustomerRaw as { nDays: number }).nDays,
      };
    }

    if (typeof record.productId === 'string' && record.productId.trim().length > 0) {
      result.productId = record.productId;
    }
    if (
      typeof record.buyQuantity === 'number' &&
      Number.isInteger(record.buyQuantity) &&
      record.buyQuantity >= 1
    ) {
      result.buyQuantity = record.buyQuantity;
    }
    if (
      typeof record.getQuantity === 'number' &&
      Number.isInteger(record.getQuantity) &&
      record.getQuantity >= 1
    ) {
      result.getQuantity = record.getQuantity;
    }

    return result;
  } catch {
    return {};
  }
}

export function hasNewCustomerConditionEnabled(promotion: StorePromotion): boolean {
  return parseStorePromotionConditions(promotion.conditions).newCustomer?.enabled === true;
}

export function hasLoggedInOnlyConditionEnabled(promotion: StorePromotion): boolean {
  return parseStorePromotionConditions(promotion.conditions).loggedInOnly?.enabled === true;
}

/** Guest soft gate (UI-L-005): loggedInOnly OR newCustomer → GUEST_REQUIRED. */
function hasGuestAuthConditionEnabled(promotion: StorePromotion): boolean {
  return hasLoggedInOnlyConditionEnabled(promotion) || hasNewCustomerConditionEnabled(promotion);
}

export function formatPromotionDiscountTitle(promotion: StorePromotion): string {
  if (promotion.type === 'buy_x_get_y') {
    const { buyQuantity, getQuantity } = parseStorePromotionConditions(promotion.conditions);
    if (buyQuantity != null && getQuantity != null) {
      return `ซื้อ ${buyQuantity} แถม ${getQuantity}`;
    }
    return 'ซื้อแถม';
  }

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

type BxGyUnitSlot = { unitPrice: number; lineIndex: number; variantId: string };

/**
 * Rule A: freeN = floor(Q / (X + Y)) * Y for same-product P lines.
 * Returns 0 when conditions incomplete or cartLines omitted.
 */
export function computeBxGyFreeUnits(
  promotion: StorePromotion,
  cartLines: PromotionEstimateCartLine[] | undefined,
): number {
  if (cartLines == null) return 0;

  const {
    productId,
    buyQuantity: x,
    getQuantity: y,
  } = parseStorePromotionConditions(promotion.conditions);
  if (!productId || x == null || y == null) return 0;

  let q = 0;
  for (const line of cartLines) {
    if (line.productId !== productId) continue;
    q += Math.max(0, Math.floor(Number(line.quantity)) || 0);
  }

  return Math.floor(q / (x + y)) * y;
}

/**
 * Rule B: sum of cheapest freeN unit prices of P (stable tie-break: line index, variantId).
 * Modal preview only — do not use for CheckoutOrderItemRow free-unit badges.
 */
function estimateBuyXGetYDiscount(
  promotion: StorePromotion,
  cartLines: PromotionEstimateCartLine[] | undefined,
): number {
  if (cartLines == null) return 0;

  const {
    productId,
    buyQuantity: x,
    getQuantity: y,
  } = parseStorePromotionConditions(promotion.conditions);
  if (!productId || x == null || y == null) return 0;

  const units: BxGyUnitSlot[] = [];
  for (let lineIndex = 0; lineIndex < cartLines.length; lineIndex++) {
    const line = cartLines[lineIndex];
    if (line.productId !== productId) continue;
    const qty = Math.max(0, Math.floor(Number(line.quantity)) || 0);
    const variantId = line.variantId ?? '';
    for (let u = 0; u < qty; u++) {
      units.push({
        unitPrice: Number(line.unitPrice),
        lineIndex,
        variantId,
      });
    }
  }

  const freeN = Math.floor(units.length / (x + y)) * y;
  if (freeN === 0) return 0;

  units.sort((a, b) => {
    if (a.unitPrice !== b.unitPrice) return a.unitPrice - b.unitPrice;
    if (a.lineIndex !== b.lineIndex) return a.lineIndex - b.lineIndex;
    if (a.variantId < b.variantId) return -1;
    if (a.variantId > b.variantId) return 1;
    return 0;
  });

  let discountAmount = 0;
  for (let i = 0; i < freeN; i++) {
    discountAmount += units[i].unitPrice;
  }
  return discountAmount;
}

/**
 * Client coupon preview estimate.
 * Parameter `eligibleBase` is store- or platform-scoped merchandise base.
 * Optional `cartLines` required for accurate buy_x_get_y Rule A/B preview.
 * Not the source for line free-unit badges (validatePromotion.freeUnits / task-09).
 */
export function estimatePromotionDiscount(
  promotion: StorePromotion,
  eligibleBase: number,
  cartLines?: PromotionEstimateCartLine[],
): number {
  let discountAmount = 0;

  if (promotion.type === 'percentage') {
    discountAmount = (eligibleBase * promotion.discountValue) / 100;
  } else if (promotion.type === 'fixed_amount') {
    discountAmount = promotion.discountValue;
  } else if (promotion.type === 'buy_x_get_y') {
    discountAmount = estimateBuyXGetYDiscount(promotion, cartLines);
  }

  if (promotion.maxDiscountAmount != null) {
    discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
  }

  return Math.min(discountAmount, eligibleBase);
}

/** Map cart GraphQL items → estimate/validate line shape. */
export function toPromotionEstimateCartLines(
  items: Array<{
    quantity: number;
    variantId?: string | null;
    productVariant?: {
      price?: number | null;
      product?: { id?: string | null } | null;
    } | null;
  }>,
): PromotionEstimateCartLine[] {
  const lines: PromotionEstimateCartLine[] = [];

  for (const item of items) {
    const productId = item.productVariant?.product?.id;
    const unitPrice = item.productVariant?.price;
    if (!productId || unitPrice == null) continue;

    lines.push({
      productId,
      quantity: item.quantity,
      unitPrice,
      variantId: item.variantId ?? undefined,
    });
  }

  return lines;
}

export function isPromotionAvailable(
  promotion: StorePromotion,
  storeSubtotal: number,
  context?: PromotionAvailabilityContext,
): boolean {
  if (context?.isGuest && hasGuestAuthConditionEnabled(promotion)) {
    return false;
  }

  const minPurchase = promotion.minPurchaseAmount ?? 0;
  if (storeSubtotal < minPurchase) {
    return false;
  }

  if (promotion.type === 'buy_x_get_y' && context?.cartLines !== undefined) {
    if (computeBxGyFreeUnits(promotion, context.cartLines) === 0) {
      return false;
    }
  }

  return true;
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

function indexBatchItems(batchItems: PromotionEligibilityBatchItem[]): {
  byId: Map<string, PromotionEligibilityBatchItem>;
  byCode: Map<string, PromotionEligibilityBatchItem>;
} {
  const byId = new Map<string, PromotionEligibilityBatchItem>();
  const byCode = new Map<string, PromotionEligibilityBatchItem>();

  for (const item of batchItems) {
    if (item.id) {
      byId.set(item.id, item);
    }
    if (item.code) {
      byCode.set(item.code.toUpperCase(), item);
    }
  }

  return { byId, byCode };
}

function resolveBatchItem(
  promotion: StorePromotion,
  byId: Map<string, PromotionEligibilityBatchItem>,
  byCode: Map<string, PromotionEligibilityBatchItem>,
): PromotionEligibilityBatchItem | undefined {
  const byPromoId = byId.get(promotion.id);
  if (byPromoId) return byPromoId;
  return byCode.get(promotion.code.toUpperCase());
}

function softReasonOverrideFromBatch(
  batchItem: PromotionEligibilityBatchItem,
): UnavailablePromotionReason {
  const reason = batchItem.ineligibilityReason;
  if (reason == null || reason === '') {
    return 'UNKNOWN';
  }
  return mapSoftIneligibilityReason(reason);
}

/**
 * Hybrid Rule G: client-local ∪ batch soft-ineligible, batch override per promo.
 * Shared by both checkout promotion modals — do not fork per modal.
 */
export function mergeListTimeEligibility(
  promotions: StorePromotion[],
  storeSubtotal: number,
  context: PromotionAvailabilityContext | undefined,
  batchItems: PromotionEligibilityBatchItem[] | null | undefined,
  batchStatus: ListTimeBatchStatus,
): MergedListTimeEligibility {
  const client = categorizeStorePromotions(promotions, storeSubtotal, context);
  const softEligibilityError = batchStatus === 'error';

  if (batchStatus !== 'success' || !batchItems) {
    return {
      available: client.available,
      unavailable: client.unavailable.map((promotion) => ({ promotion })),
      softEligibilityError,
    };
  }

  const { byId, byCode } = indexBatchItems(batchItems);
  const clientUnavailableIds = new Set(client.unavailable.map((p) => p.id));
  const unavailable: UnavailableStorePromotionEntry[] = [];
  const unavailableIds = new Set<string>();

  for (const promotion of promotions) {
    if (unavailableIds.has(promotion.id)) continue;

    const batchItem = resolveBatchItem(promotion, byId, byCode);

    if (batchItem && batchItem.eligible === false) {
      unavailable.push({
        promotion,
        softReasonOverride: softReasonOverrideFromBatch(batchItem),
      });
      unavailableIds.add(promotion.id);
      continue;
    }

    if (clientUnavailableIds.has(promotion.id)) {
      unavailable.push({ promotion });
      unavailableIds.add(promotion.id);
    }
  }

  const available: StorePromotion[] = [];
  for (const promotion of client.available) {
    if (!unavailableIds.has(promotion.id)) {
      available.push(promotion);
    }
  }

  return {
    available,
    unavailable,
    softEligibilityError: false,
  };
}

/**
 * Prefer specific soft reason when known (UI Spec UnavailableStorePromotionCard).
 * Guest + (loggedInOnly OR newCustomer) wins over min-purchase; BxGy freeN=0 → BXGY_QTY.
 */
export function getUnavailablePromotionReason(
  promotion: StorePromotion,
  storeSubtotal: number,
  context?: PromotionAvailabilityContext,
): UnavailablePromotionReason {
  if (context?.isGuest && hasGuestAuthConditionEnabled(promotion)) {
    return 'GUEST_REQUIRED';
  }

  const minPurchase = promotion.minPurchaseAmount ?? 0;
  if (minPurchase > 0 && storeSubtotal < minPurchase) {
    return 'MIN_PURCHASE';
  }

  if (promotion.type === 'buy_x_get_y' && context?.cartLines !== undefined) {
    if (computeBxGyFreeUnits(promotion, context.cartLines) === 0) {
      return 'BXGY_QTY';
    }
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
    case 'NOT_NEW_CUSTOMER':
      return NOT_NEW_CUSTOMER_WARNING;
    case 'BXGY_QTY':
      return BXGY_QTY_WARNING;
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
    case 'BXGY_QTY':
      return { label: MIN_PURCHASE_CTA_LABEL, href: MIN_PURCHASE_CTA_HREF };
    case 'NOT_NEW_CUSTOMER':
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
