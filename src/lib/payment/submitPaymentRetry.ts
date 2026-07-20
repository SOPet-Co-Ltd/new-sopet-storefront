import type { PaymentRetrySubmitInput } from '@/components/organisms/OrderPaymentForm/PaymentRetryPanel';
import { threeDSAutoRedirectStorageKey } from '@/components/organisms/OrderPaymentForm/Payment3dsAutoRedirect';
import type { CreatePaymentInput } from '@/lib/graphql/generated/graphql';

export class PaymentRetryError extends Error {
  constructor(
    message: string,
    public readonly code: 'payment_failed' | 'same_payment_id',
  ) {
    super(message);
    this.name = 'PaymentRetryError';
  }
}

export type PaymentRetryContext = {
  orderId: string;
  amount: number;
  currency: string;
  currentPaymentId: string;
};

/** Aligns with submitCheckout paymentInput mapping for same-order recovery. */
export function buildPaymentRetryInput(
  context: PaymentRetryContext,
  submit: PaymentRetrySubmitInput,
): CreatePaymentInput {
  return {
    orderId: context.orderId,
    amount: context.amount,
    currency: context.currency || 'THB',
    paymentMethod: submit.paymentMethod,
    ...(submit.savedPaymentMethodId
      ? { savedPaymentMethodId: submit.savedPaymentMethodId }
      : submit.omiseToken
        ? { omiseToken: submit.omiseToken }
        : {}),
  };
}

/**
 * SameOrderCreatePayment storefront half: reject missing or same-as-pending id
 * so we never soft-succeed on a superseded pending payment.
 */
export function resolveNewPaymentId(
  currentPaymentId: string,
  newPaymentId: string | undefined | null,
): string {
  if (!newPaymentId) {
    throw new PaymentRetryError('ไม่สามารถสร้างการชำระเงินได้', 'payment_failed');
  }

  if (newPaymentId === currentPaymentId) {
    throw new PaymentRetryError(
      'ไม่สามารถสร้างการชำระเงินใหม่ได้ กรุณาลองใหม่อีกครั้ง',
      'same_payment_id',
    );
  }

  return newPaymentId;
}

/** Clear one-shot gate for the abandoned paymentId so it cannot linger. */
export function clearPriorPayment3dsAutoRedirect(paymentId: string): void {
  try {
    sessionStorage.removeItem(threeDSAutoRedirectStorageKey(paymentId));
  } catch {
    // sessionStorage unavailable — new paymentId still uses a distinct key
  }
}
