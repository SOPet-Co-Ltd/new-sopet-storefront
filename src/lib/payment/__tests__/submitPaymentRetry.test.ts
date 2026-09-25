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

    expect(buildPaymentRetryInput(context, { paymentMethod: 'bank_transfer' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'bank_transfer',
    });
  });

  it('includes platformType for TrueMoney/ShopeePay JumpApp', () => {
    const originalUa = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    expect(buildPaymentRetryInput(context, { paymentMethod: 'truemoney' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'truemoney',
      platformType: 'IOS',
    });

    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () =>
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    });

    expect(buildPaymentRetryInput(context, { paymentMethod: 'shopeepay' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'shopeepay',
      platformType: 'WEB',
    });

    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => originalUa,
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

  it('includes guestPayToken from sessionStorage when present', () => {
    sessionStorage.setItem('sopet_guest_pay:order-1', 'token-xyz');
    expect(buildPaymentRetryInput(context, { paymentMethod: 'promptpay' })).toEqual({
      orderId: 'order-1',
      amount: 540,
      currency: 'THB',
      paymentMethod: 'promptpay',
      guestPayToken: 'token-xyz',
    });
  });
});
