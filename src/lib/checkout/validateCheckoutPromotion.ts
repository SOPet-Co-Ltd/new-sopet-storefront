import type { PromotionValidation } from '@/lib/hooks/useCheckout';
import type {
  ValidatePromotionInput,
  ValidatePromotionLineInput,
} from '@/lib/graphql/generated/graphql';
import {
  mapSoftIneligibilityReason,
  type SoftCustomerReason,
  type PromotionEstimateCartLine,
} from '@/lib/checkout/storePromotionUtils';
import { extractErrorCode } from '@/lib/errors/getErrorMessage';

export class PromotionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromotionValidationError';
  }
}

/** Soft eligibility from validatePromotion — not an invalid-code hard failure. */
export class SoftPromotionIneligibilityError extends Error {
  constructor(
    message: string,
    public readonly customerReason: SoftCustomerReason,
    public readonly ineligibilityReason: string,
    public readonly validation: PromotionValidation,
  ) {
    super(message);
    this.name = 'SoftPromotionIneligibilityError';
  }
}

export type ValidateCheckoutPromotionParams = {
  code: string;
  subtotal: number;
  storeId?: string | null;
  /** Shipping fee base for shipping-type promo preview/confirm. */
  shippingFee?: number | null;
  /** Cart lines for accurate BxGy preview (Design Doc validatePromotion contract). */
  lines?: PromotionEstimateCartLine[] | ValidatePromotionLineInput[];
  validatePromotion: (input: ValidatePromotionInput) => Promise<PromotionValidation | undefined>;
};

/** Hard createOrder eligibility / structural codes (Candidate-001) → order error UX. */
export const CREATE_ORDER_HARD_ELIGIBILITY_CODES = [
  'GUEST',
  'ORDER_HISTORY',
  'ACCOUNT_AGE',
  'MISSING_LINES',
  'INVALID_PROMOTION',
  'PROMOTION_EXPIRED',
  'PROMOTION_NOT_STARTED',
  'PROMOTION_LIMIT',
  'PROMOTION_CUSTOMER_LIMIT',
  'PROMOTION_STORE',
  'PROMOTION_SCOPE',
  'PROMOTION_MIN_PURCHASE',
] as const;

/**
 * INSUFFICIENT_QTY is preview-only on createOrder (apply = skip promo).
 * Never treat as order-failure when order succeeds with that BxGy omitted.
 */
export function isCreateOrderHardEligibilityCode(code: string | null | undefined): boolean {
  if (!code) return false;
  if (code === 'INSUFFICIENT_QTY') return false;
  return (CREATE_ORDER_HARD_ELIGIBILITY_CODES as readonly string[]).includes(code);
}

/** Extract machine-readable promotion error code from Apollo / Nest GraphQL errors. */
export function extractPromotionErrorCode(error: unknown): string | null {
  const code = extractErrorCode(error);
  if (!code) return null;

  if (code === 'INSUFFICIENT_QTY') return code;
  if ((CREATE_ORDER_HARD_ELIGIBILITY_CODES as readonly string[]).includes(code)) {
    return code;
  }

  // createOrder may surface other structural codes (e.g. suspended store) — return them.
  return code;
}

export function toValidatePromotionLines(
  lines: PromotionEstimateCartLine[] | ValidatePromotionLineInput[] | undefined,
  storeId?: string | null,
): ValidatePromotionLineInput[] | undefined {
  if (!lines?.length) return undefined;

  return lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    variantId: 'variantId' in line ? (line.variantId ?? undefined) : undefined,
    storeId: 'storeId' in line && line.storeId != null ? line.storeId : (storeId ?? undefined),
  }));
}

export async function validateCheckoutPromotionCode({
  code,
  subtotal,
  storeId,
  shippingFee,
  lines,
  validatePromotion,
}: ValidateCheckoutPromotionParams): Promise<PromotionValidation> {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    throw new PromotionValidationError('กรุณากรอกโค้ดส่วนลด');
  }

  const mappedLines = toValidatePromotionLines(lines, storeId);
  const resolvedShippingFee =
    shippingFee != null && Number.isFinite(shippingFee) ? shippingFee : undefined;

  const result = await validatePromotion({
    code: trimmedCode,
    subtotal,
    ...(storeId ? { storeId } : {}),
    ...(resolvedShippingFee != null ? { shippingFee: resolvedShippingFee } : {}),
    ...(mappedLines ? { lines: mappedLines } : {}),
  });

  if (!result?.code) {
    throw new PromotionValidationError('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
  }

  const softReason = result.ineligibilityReason?.trim();
  if (softReason) {
    const customerReason = mapSoftIneligibilityReason(softReason);
    throw new SoftPromotionIneligibilityError(
      getSoftIneligibilityMessage(customerReason),
      customerReason,
      softReason,
      result,
    );
  }

  return result;
}

function getSoftIneligibilityMessage(reason: SoftCustomerReason): string {
  switch (reason) {
    case 'GUEST_REQUIRED':
      return 'โปรโมชันนี้สำหรับสมาชิกเท่านั้น กรุณาเข้าสู่ระบบหรือสมัครสมาชิก';
    case 'NOT_NEW_CUSTOMER':
      return 'โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น';
    case 'BXGY_QTY':
      return 'เพิ่มสินค้าในโปรให้ครบเงื่อนไขซื้อแถม';
    case 'MIN_PURCHASE':
    case 'UNKNOWN':
    default:
      return 'ยังใช้โปรโมชันนี้ไม่ได้ในขณะนี้';
  }
}
