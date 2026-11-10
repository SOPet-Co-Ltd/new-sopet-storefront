/** Metadata for createPayment.saveCard — card is saved server-side only after paid. */
export type SaveCardOnPaymentInput = {
  cardToken: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
};

export function buildSaveCardPayload(input: {
  cardToken: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}): SaveCardOnPaymentInput {
  return {
    cardToken: input.cardToken,
    lastFour: input.lastFour,
    brand: input.brand,
    expiryMonth: input.expiryMonth,
    expiryYear: input.expiryYear,
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}
