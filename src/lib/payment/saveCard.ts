import { encryptCardTransportPayload } from '@/lib/payment/cardTransport';

/** Payload for createPayment.saveCard — cardCipher is RSA transport ciphertext. CVV is never included. */
export type SaveCardOnPaymentInput = {
  cardCipher: string;
  isDefault?: boolean;
};

export async function buildSaveCardPayload(input: {
  cardholderName: string;
  pan: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}): Promise<SaveCardOnPaymentInput> {
  const cardCipher = await encryptCardTransportPayload({
    cardholderName: input.cardholderName,
    pan: input.pan,
    expiryMonth: input.expiryMonth,
    expiryYear: input.expiryYear,
  });

  return {
    cardCipher,
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}
