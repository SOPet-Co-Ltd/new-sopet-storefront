/** Client-side timeout for Beam tokenize and card public-key fetch (not createPayment). */
export const CARD_PAYMENT_NETWORK_TIMEOUT_MS = 20_000;

export const CARD_PAYMENT_NETWORK_TIMEOUT_MESSAGE = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองอีกครั้ง';

export class CardPaymentNetworkError extends Error {
  constructor(message = CARD_PAYMENT_NETWORK_TIMEOUT_MESSAGE) {
    super(message);
    this.name = 'CardPaymentNetworkError';
  }
}

export function cardPaymentNetworkAbortSignal(
  timeoutMs: number = CARD_PAYMENT_NETWORK_TIMEOUT_MS,
): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

/** Map AbortError / TimeoutError to the shopper-facing slow-connection copy. */
export function toCardPaymentNetworkError(error: unknown): Error {
  if (error instanceof CardPaymentNetworkError) {
    return error;
  }
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return new CardPaymentNetworkError();
    }
    return error;
  }
  return new CardPaymentNetworkError();
}
