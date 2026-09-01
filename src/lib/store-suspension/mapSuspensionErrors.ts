import {
  ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE,
  PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE,
  STORE_SUSPENDED_ERROR_CODE,
  STORE_SUSPENSION_HOLD_COPY,
} from '@/lib/constants/storeSuspensionHoldCopy';
import { extractErrorCode } from '@/lib/errors/getErrorMessage';

function errorCodeFromUnknown(error: unknown): string | null {
  return extractErrorCode(error);
}

export function mapStoreSuspendedCartError(error: unknown): string | null {
  return errorCodeFromUnknown(error) === STORE_SUSPENDED_ERROR_CODE
    ? STORE_SUSPENSION_HOLD_COPY.cartAddSuspended
    : null;
}

export function mapCheckoutSuspendedStoreError(error: unknown): string | null {
  return errorCodeFromUnknown(error) === ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE
    ? STORE_SUSPENSION_HOLD_COPY.checkoutCreateSuspended
    : null;
}

export function isPaymentHeldPortionBlockedError(error: unknown): boolean {
  return errorCodeFromUnknown(error) === PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE;
}

export function mapPaymentHeldPortionBlockedError(error: unknown): string | null {
  return isPaymentHeldPortionBlockedError(error)
    ? STORE_SUSPENSION_HOLD_COPY.paymentHeldBlocked
    : null;
}
