import type { PromotionValidation } from '@/lib/hooks/useCheckout';
import type { ValidatePromotionInput } from '@/lib/graphql/generated/graphql';

export class PromotionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromotionValidationError';
  }
}

export type ValidateCheckoutPromotionParams = {
  code: string;
  subtotal: number;
  validatePromotion: (input: ValidatePromotionInput) => Promise<PromotionValidation | undefined>;
};

export async function validateCheckoutPromotionCode({
  code,
  subtotal,
  validatePromotion,
}: ValidateCheckoutPromotionParams): Promise<PromotionValidation> {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    throw new PromotionValidationError('กรุณากรอกโค้ดส่วนลด');
  }

  const result = await validatePromotion({
    code: trimmedCode,
    subtotal,
  });

  if (!result?.code) {
    throw new PromotionValidationError('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
  }

  return result;
}
