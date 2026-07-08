import type { PaymentMethod } from '@/lib/providers/CheckoutProvider';

export type ApiPaymentMethod = 'promptpay' | 'credit_card' | 'cod';

export function mapCheckoutPaymentMethodForApi(
  paymentMethod: PaymentMethod | string | null | undefined,
): ApiPaymentMethod {
  if (paymentMethod === 'card') {
    return 'credit_card';
  }

  if (paymentMethod === 'promptpay' || paymentMethod === 'credit_card' || paymentMethod === 'cod') {
    return paymentMethod;
  }

  throw new Error(`Unsupported payment method: ${String(paymentMethod)}`);
}
