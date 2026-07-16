/** MSW fixtures for promotion auto-apply storefront journeys (AC-007+, UI-AA-004–007). */

export const AUTO_APPLY_STORE_A_ID = 'store-auto-a';
export const AUTO_APPLY_STORE_B_ID = 'store-auto-b';

export const autoApplyPlatformPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-platform-auto',
  code: 'AUTO_PLAT',
  name: 'แพลตฟอร์มอัตโนมัติ',
  description: 'ลดเพิ่มทั้งออเดอร์',
  type: 'fixed_amount',
  discountValue: 50,
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  expiresAt: '2027-05-24T00:00:00.000Z',
  scope: 'platform',
  storeId: null,
  conditions: null,
  autoApply: true,
  priority: 10,
};

export const autoApplyStoreAPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-store-a-auto',
  code: 'AUTO_STORE_A',
  name: 'ร้าน A อัตโนมัติ',
  description: null,
  type: 'fixed_amount',
  discountValue: 30,
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  expiresAt: '2027-05-24T00:00:00.000Z',
  scope: 'store',
  storeId: AUTO_APPLY_STORE_A_ID,
  conditions: null,
  autoApply: true,
  priority: 5,
};

export const autoApplyStoreBPromotion = {
  __typename: 'PromotionType' as const,
  id: 'promo-store-b-auto',
  code: 'AUTO_STORE_B',
  name: 'ร้าน B อัตโนมัติ',
  description: null,
  type: 'fixed_amount',
  discountValue: 40,
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  expiresAt: '2027-05-24T00:00:00.000Z',
  scope: 'store',
  storeId: AUTO_APPLY_STORE_B_ID,
  conditions: null,
  autoApply: true,
  priority: 5,
};

/** Manual-only peer — must not win auto-apply ranking. */
export const manualOnlyPlatformPromotion = {
  ...autoApplyPlatformPromotion,
  id: 'promo-platform-manual',
  code: 'MANUAL_PLAT',
  name: 'แพลตฟอร์มมือ',
  discountValue: 200,
  autoApply: false,
  priority: 99,
};

export const validateAutoApplyPlatform = {
  __typename: 'PromotionValidationResult' as const,
  code: 'AUTO_PLAT',
  name: 'แพลตฟอร์มอัตโนมัติ',
  discountAmount: 50,
  ineligibilityReason: null as string | null,
  freeUnits: null as number | null,
};

export const validateAutoApplyStoreA = {
  __typename: 'PromotionValidationResult' as const,
  code: 'AUTO_STORE_A',
  name: 'ร้าน A อัตโนมัติ',
  discountAmount: 30,
  ineligibilityReason: null as string | null,
  freeUnits: null as number | null,
};

export const validateAutoApplyStoreB = {
  __typename: 'PromotionValidationResult' as const,
  code: 'AUTO_STORE_B',
  name: 'ร้าน B อัตโนมัติ',
  discountAmount: 40,
  ineligibilityReason: null as string | null,
  freeUnits: null as number | null,
};

export const validateSoftFail = {
  __typename: 'PromotionValidationResult' as const,
  code: 'SOFT_FAIL',
  name: 'Soft fail',
  discountAmount: 0,
  ineligibilityReason: 'INSUFFICIENT_QTY' as string | null,
  freeUnits: null as number | null,
};
