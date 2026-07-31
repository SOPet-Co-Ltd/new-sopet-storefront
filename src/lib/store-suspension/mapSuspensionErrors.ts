import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE,
  PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE,
  STORE_SUSPENDED_ERROR_CODE,
  STORE_SUSPENSION_HOLD_COPY,
} from '@/lib/constants/storeSuspensionHoldCopy';

function errorCodeFromUnknown(error: unknown): string | null {
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors.find((graphError) => typeof graphError.extensions?.code === 'string')
      ?.extensions?.code;
    return typeof code === 'string' ? code : null;
  }

  if (error && typeof error === 'object') {
    const record = error as {
      graphQLErrors?: Array<{ extensions?: { code?: unknown } }>;
      errors?: Array<{ extensions?: { code?: unknown } }>;
      message?: string;
    };

    const fromGraphQL = record.graphQLErrors?.find(
      (graphError) => typeof graphError.extensions?.code === 'string',
    )?.extensions?.code;
    if (typeof fromGraphQL === 'string') return fromGraphQL;

    const fromErrors = record.errors?.find(
      (graphError) => typeof graphError.extensions?.code === 'string',
    )?.extensions?.code;
    if (typeof fromErrors === 'string') return fromErrors;

    if (typeof record.message === 'string') {
      if (record.message.includes(STORE_SUSPENDED_ERROR_CODE)) {
        return STORE_SUSPENDED_ERROR_CODE;
      }
      if (record.message.includes(ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE)) {
        return ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE;
      }
      if (record.message.includes(PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE)) {
        return PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE;
      }
    }
  }

  if (error instanceof Error) {
    if (error.message.includes(STORE_SUSPENDED_ERROR_CODE)) {
      return STORE_SUSPENDED_ERROR_CODE;
    }
    if (error.message.includes(ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE)) {
      return ORDER_CONTAINS_SUSPENDED_STORE_ERROR_CODE;
    }
    if (error.message.includes(PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE)) {
      return PAYMENT_HELD_PORTION_BLOCKED_ERROR_CODE;
    }
  }

  return null;
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
