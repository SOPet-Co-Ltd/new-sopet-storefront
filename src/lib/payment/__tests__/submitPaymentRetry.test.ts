import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { threeDSAutoRedirectStorageKey } from '@/components/organisms/OrderPaymentForm/Payment3dsAutoRedirect';
import {
  buildPaymentRetryInput,
  clearPriorPayment3dsAutoRedirect,
  PaymentRetryError,
  resolveNewPaymentId,
} from '@/lib/payment/submitPaymentRetry';

const context = {
  orderId: 'order-1',
  amount: 540,
  currency: 'THB',
  currentPaymentId: 'payment-old',
};

describe('submitPaymentRetry', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('builds createPayment input aligned with submitCheckout mapping', () => {
    expect(
      buildPaymentRetryInput(context, {
        paymentMethod: 'credit_card',
        omiseToken: 'tokn_test',
      }),
    ).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'credit_card',
      omiseToken: 'tokn_test',
    });

    expect(
      buildPaymentRetryInput(context, {
        paymentMethod: 'credit_card',
        savedPaymentMethodId: 'saved-1',
      }),
    ).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'credit_card',
      savedPaymentMethodId: 'saved-1',
    });

    expect(buildPaymentRetryInput(context, { paymentMethod: 'promptpay' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'promptpay',
    });

    expect(buildPaymentRetryInput(context, { paymentMethod: 'cod' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'cod',
    });
  });

  it('resolveNewPaymentId accepts a distinct id and rejects same/missing', () => {
    expect(resolveNewPaymentId('payment-old', 'payment-new')).toBe('payment-new');

    expect(() => resolveNewPaymentId('payment-old', 'payment-old')).toThrow(PaymentRetryError);
    expect(() => resolveNewPaymentId('payment-old', undefined)).toThrow(PaymentRetryError);
  });

  it('clearPriorPayment3dsAutoRedirect removes the old one-shot key', () => {
    const key = threeDSAutoRedirectStorageKey('payment-old');
    sessionStorage.setItem(key, 'https://pay.omise.co/old');
    clearPriorPayment3dsAutoRedirect('payment-old');
    expect(sessionStorage.getItem(key)).toBeNull();
  });
});
