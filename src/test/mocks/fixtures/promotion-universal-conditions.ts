/**
 * Fixture data for Promotion Universal Conditions fixture-e2e journeys.
 * ADR-0007 / Frontend Design Doc § Data Contracts — camelCase conditions JSON.
 *
 * Consumed by:
 * - Journey 1 (guest + newCustomer) — frontend-task-04
 * - Journey 2 (BxGy + fixed_amount) — frontend-task-10
 * - promotion-logged-in-only Journeys 1–2 — loggedInOnly / both-keys / newCustomer-only stubs
 *
 * Auth mocking (document for later journeys):
 * - Guest: `vi.mock('@/lib/hooks/useAuth')` → `{ isAuthenticated: false, customer: null }`
 * - Logged-in: `{ isAuthenticated: true, customer: { id, createdAt } }` (eligible new-customer
 *   when account age ≤ nDays and no paid-path history — server gates; client uses guest flag only)
 */

import { CHECKOUT_STORE_ID } from './checkout';
import { CATALOG_PRODUCT_ID } from './catalog';

/** Stable product P for Buy2Get1 / Rule B fixtures. */
export const BXGY_PRODUCT_ID = CATALOG_PRODUCT_ID;

export const NEW_CUSTOMER_N_DAYS = 30;

/** ADR conditions: new-customer only (omit when toggle off). */
export type NewCustomerConditions = {
  newCustomer: { enabled: true; nDays: number };
};

/** ADR Rule L5 — members-only / logged-in only (omit when off). */
export type LoggedInOnlyConditions = {
  loggedInOnly: { enabled: true };
};

/** ADR conditions: BxGy same-product keys. */
export type BxGyConditions = {
  productId: string;
  buyQuantity: number;
  getQuantity: number;
};

export type PromotionConditionsJson = Partial<
  NewCustomerConditions & LoggedInOnlyConditions & BxGyConditions
> &
  Record<string, unknown>;

export function buildNewCustomerConditions(
  nDays: number = NEW_CUSTOMER_N_DAYS,
): NewCustomerConditions {
  return { newCustomer: { enabled: true, nDays } };
}

/** Rule L5 ON — exactly `loggedInOnly: { enabled: true }`. */
export function buildLoggedInOnlyConditions(): LoggedInOnlyConditions {
  return { loggedInOnly: { enabled: true } };
}

/** Both keys — guest OR-gate (UI-L-005); single GUEST_REQUIRED soft copy. */
export function buildLoggedInOnlyAndNewCustomerConditions(
  nDays: number = NEW_CUSTOMER_N_DAYS,
): LoggedInOnlyConditions & NewCustomerConditions {
  return {
    ...buildLoggedInOnlyConditions(),
    ...buildNewCustomerConditions(nDays),
  };
}

export function buildBxGyConditions(overrides?: Partial<BxGyConditions>): BxGyConditions {
  return {
    productId: BXGY_PRODUCT_ID,
    buyQuantity: 2,
    getQuantity: 1,
    ...overrides,
  };
}

/** Stringify for GraphQL `conditions: String` payloads. */
export function stringifyConditions(conditions: PromotionConditionsJson): string {
  return JSON.stringify(conditions);
}

export function parseConditions(raw: string | null | undefined): PromotionConditionsJson {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as PromotionConditionsJson;
  } catch {
    return {};
  }
}

const basePromotionFields = {
  description: null as string | null,
  minPurchaseAmount: null as number | null,
  maxDiscountAmount: null as number | null,
  expiresAt: '2027-05-24T00:00:00.000Z',
};

/** Journey 1 — store promo gated by newCustomer (guest → unavailable). */
export const guestNewCustomerStorePromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-uc-store-new-customer',
  code: 'NEWSTORE30',
  name: 'ลูกค้าใหม่ร้าน',
  type: 'percentage',
  discountValue: 10,
  ...basePromotionFields,
  scope: 'store',
  storeId: CHECKOUT_STORE_ID,
  conditions: stringifyConditions(buildNewCustomerConditions()),
};

/** Journey 1 — platform promo gated by newCustomer. */
export const guestNewCustomerPlatformPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-uc-platform-new-customer',
  code: 'NEWPLAT30',
  name: 'ลูกค้าใหม่แพลตฟอร์ม',
  type: 'fixed_amount',
  discountValue: 50,
  ...basePromotionFields,
  scope: 'platform',
  storeId: null as string | null,
  conditions: stringifyConditions(buildNewCustomerConditions()),
};

/**
 * promotion-logged-in-only Journey 1 — store promo gated by loggedInOnly only
 * (guest → unavailable / GUEST_REQUIRED; no newCustomer key).
 */
export const guestLoggedInOnlyStorePromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-lio-store-members-only',
  code: 'MEMBERSTORE10',
  name: 'สมาชิกเท่านั้นร้าน',
  type: 'percentage',
  discountValue: 10,
  ...basePromotionFields,
  scope: 'store',
  storeId: CHECKOUT_STORE_ID,
  conditions: stringifyConditions(buildLoggedInOnlyConditions()),
};

/** promotion-logged-in-only Journey 1 — platform promo gated by loggedInOnly only. */
export const guestLoggedInOnlyPlatformPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-lio-platform-members-only',
  code: 'MEMBERPLAT50',
  name: 'สมาชิกเท่านั้นแพลตฟอร์ม',
  type: 'fixed_amount',
  discountValue: 50,
  ...basePromotionFields,
  scope: 'platform',
  storeId: null as string | null,
  conditions: stringifyConditions(buildLoggedInOnlyConditions()),
};

/**
 * promotion-logged-in-only Journey 1 — both keys on (guest still single GUEST_REQUIRED).
 */
export const guestLoggedInOnlyAndNewCustomerStorePromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-lio-store-both-keys',
  code: 'BOTHSTORE10',
  name: 'สมาชิก+ลูกค้าใหม่ร้าน',
  type: 'percentage',
  discountValue: 10,
  ...basePromotionFields,
  scope: 'store',
  storeId: CHECKOUT_STORE_ID,
  conditions: stringifyConditions(buildLoggedInOnlyAndNewCustomerConditions()),
};

export const guestLoggedInOnlyAndNewCustomerPlatformPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-lio-platform-both-keys',
  code: 'BOTHPLAT50',
  name: 'สมาชิก+ลูกค้าใหม่แพลตฟอร์ม',
  type: 'fixed_amount',
  discountValue: 50,
  ...basePromotionFields,
  scope: 'platform',
  storeId: null as string | null,
  conditions: stringifyConditions(buildLoggedInOnlyAndNewCustomerConditions()),
};

/** Journey 2 — Buy2Get1 on product P (conditions include productId / X / Y). */
export const bxgyStorePromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-uc-bxgy-buy2get1',
  code: 'BUY2GET1',
  name: 'ซื้อ 2 แถม 1',
  type: 'buy_x_get_y',
  discountValue: 0,
  ...basePromotionFields,
  scope: 'store',
  storeId: CHECKOUT_STORE_ID,
  conditions: stringifyConditions({
    ...buildBxGyConditions(),
    ...buildNewCustomerConditions(),
  }),
};

/** Journey 2 — fixed_amount V=100 for clamp preview against eligible base B. */
export const fixedAmountClampPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-uc-fixed-clamp',
  code: 'FIXED100',
  name: 'ลด 100 บาท',
  type: 'fixed_amount',
  discountValue: 100,
  ...basePromotionFields,
  scope: 'store',
  storeId: CHECKOUT_STORE_ID,
  conditions: stringifyConditions({}),
};

/**
 * validatePromotion soft/hard shapes (Backend DD / Design Doc).
 * Soft: discountAmount=0 + ineligibilityReason — no hard GraphQL error.
 */
export const validatePromotionBxGyEligible = {
  __typename: 'PromotionValidationResult' as const,
  code: 'BUY2GET1',
  name: 'ซื้อ 2 แถม 1',
  discountAmount: 200,
  ineligibilityReason: null as string | null,
  freeUnits: 1,
};

export const validatePromotionBxGyInsufficientQty = {
  __typename: 'PromotionValidationResult' as const,
  code: 'BUY2GET1',
  name: 'ซื้อ 2 แถม 1',
  discountAmount: 0,
  ineligibilityReason: 'INSUFFICIENT_QTY',
  freeUnits: 0,
};

export const validatePromotionGuestRequired = {
  __typename: 'PromotionValidationResult' as const,
  code: 'NEWSTORE30',
  name: 'ลูกค้าใหม่ร้าน',
  discountAmount: 0,
  ineligibilityReason: 'GUEST',
  freeUnits: null as number | null,
};

/** Soft GUEST for loggedInOnly-only promo (reuse same machine code; AC-018/019). */
export const validatePromotionLoggedInOnlyGuestRequired = {
  __typename: 'PromotionValidationResult' as const,
  code: 'MEMBERSTORE10',
  name: 'สมาชิกเท่านั้นร้าน',
  discountAmount: 0,
  ineligibilityReason: 'GUEST',
  freeUnits: null as number | null,
};

/** Cart lines for Journey 2 — Q=3 of product P (Buy2Get1 → freeN=1). */
export const bxgyCartLines = [
  {
    productId: BXGY_PRODUCT_ID,
    variantId: 'var-bxgy-a',
    quantity: 2,
    unitPrice: 300,
    storeId: CHECKOUT_STORE_ID,
  },
  {
    productId: BXGY_PRODUCT_ID,
    variantId: 'var-bxgy-b',
    quantity: 1,
    unitPrice: 200,
    storeId: CHECKOUT_STORE_ID,
  },
] as const;

/** Eligible base B=60 for fixed_amount V=100 → preview min(V,B)=60. */
export const FIXED_AMOUNT_ELIGIBLE_BASE = 60;

/** UI Spec soft-reason labels used by later journey assertions (fixture labels only). */
export const SOFT_REASON_FIXTURE_LABELS = {
  GUEST_REQUIRED: 'โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก',
  GUEST_CTA: 'เข้าสู่ระบบ',
  BXGY_QTY: 'เพิ่มสินค้าในโปรให้ครบเงื่อนไขซื้อแถม',
  NOT_NEW_CUSTOMER: 'โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น',
} as const;

export const AUTH_MOCK_USAGE = {
  guest: {
    description: 'Journey 1 — mock useAuth as unauthenticated guest',
    useAuthReturn: { isAuthenticated: false, customer: null },
  },
  loggedIn: {
    description:
      'Journey 2 — mock useAuth as authenticated customer (eligible new-customer / BxGy path)',
    useAuthReturn: {
      isAuthenticated: true,
      customer: {
        id: 'cust-uc-eligible',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    },
  },
  loggedInMembersOnly: {
    description:
      'promotion-logged-in-only Journey 2 — authenticated; only-loggedInOnly available (no newCustomer)',
    useAuthReturn: {
      isAuthenticated: true,
      customer: {
        id: 'cust-lio-returning',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  },
} as const;
