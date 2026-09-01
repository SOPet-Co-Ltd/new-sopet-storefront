import { ERROR_MESSAGES } from '@/lib/errors/errorMessages';
import { extractErrorCode } from '@/lib/errors/getErrorMessage';

export const PAYMENT_ORDER_NOT_PAYABLE_COPY = ERROR_MESSAGES.ORDER_NOT_PAYABLE;

export function hasQrExpiredAt(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiresMs = Date.parse(expiresAt);
  return !Number.isNaN(expiresMs) && expiresMs <= nowMs;
}

export function isOrderNotPayableError(error: unknown): boolean {
  if (extractErrorCode(error) === 'ORDER_NOT_PAYABLE') {
    return true;
  }

  // Legacy English API text before code-only responses.
  if (error instanceof Error) {
    return error.message.includes('no longer awaiting payment');
  }

  return false;
}
