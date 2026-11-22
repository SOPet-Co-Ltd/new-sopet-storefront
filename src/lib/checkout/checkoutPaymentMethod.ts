import type { PaymentMethod } from '@/lib/providers/CheckoutProvider';

export type ApiPaymentMethod =
  'promptpay' | 'credit_card' | 'cod' | 'bank_transfer' | 'truemoney' | 'shopeepay';

export function mapCheckoutPaymentMethodForApi(
  paymentMethod: PaymentMethod | string | null | undefined,
): ApiPaymentMethod {
  if (paymentMethod === 'card') {
    return 'credit_card';
  }

  if (
    paymentMethod === 'promptpay' ||
    paymentMethod === 'credit_card' ||
    paymentMethod === 'cod' ||
    paymentMethod === 'bank_transfer' ||
    paymentMethod === 'truemoney' ||
    paymentMethod === 'shopeepay'
  ) {
    return paymentMethod;
  }

  throw new Error(`Unsupported payment method: ${String(paymentMethod)}`);
}

export function isNonOmiseApiPaymentMethod(method: ApiPaymentMethod): boolean {
  return method === 'cod' || method === 'bank_transfer';
}
