import { afterEach, describe, expect, it } from 'vitest';
import {
  clearCompletedPaymentOrder,
  getCompletedPaymentOrderId,
  isOrderAwaitingPayment,
  isPaymentOrderCompletedInSession,
  isPaymentRouteClosed,
  markPaymentOrderCompleted,
  shouldHandoffToThankYou,
} from '@/lib/payment/paymentRouteClosed';

describe('paymentRouteClosed', () => {
  afterEach(() => {
    clearCompletedPaymentOrder();
  });

  it('treats missing order status as still awaiting payment', () => {
    expect(isOrderAwaitingPayment(undefined)).toBe(true);
    expect(isOrderAwaitingPayment(null)).toBe(true);
    expect(isOrderAwaitingPayment('')).toBe(true);
    expect(isOrderAwaitingPayment('pending_payment')).toBe(true);
    expect(isOrderAwaitingPayment('pending')).toBe(true);
    expect(isOrderAwaitingPayment('paid')).toBe(false);
  });

  it('closes the route when this payment is paid', () => {
    expect(
      isPaymentRouteClosed({ status: 'paid', orderStatus: 'pending_payment', orderId: 'ord-1' }),
    ).toBe(true);
    expect(
      shouldHandoffToThankYou({
        status: 'paid',
        orderStatus: 'pending_payment',
        orderId: 'ord-1',
      }),
    ).toBe(true);
  });

  it('closes a superseded failed charge when the order is already paid', () => {
    expect(isPaymentRouteClosed({ status: 'failed', orderStatus: 'paid', orderId: 'ord-1' })).toBe(
      true,
    );
    expect(
      shouldHandoffToThankYou({ status: 'failed', orderStatus: 'paid', orderId: 'ord-1' }),
    ).toBe(true);
  });

  it('keeps unpaid pending payments open', () => {
    expect(
      isPaymentRouteClosed({
        status: 'pending',
        orderStatus: 'pending_payment',
        orderId: 'ord-1',
      }),
    ).toBe(false);
    expect(
      shouldHandoffToThankYou({
        status: 'pending',
        orderStatus: 'pending_payment',
        orderId: 'ord-1',
      }),
    ).toBe(false);
  });

  it('routes cancelled and refunded to not-payable instead of thank-you', () => {
    expect(
      isPaymentRouteClosed({ status: 'failed', orderStatus: 'cancelled', orderId: 'ord-1' }),
    ).toBe(true);
    expect(
      shouldHandoffToThankYou({
        status: 'failed',
        orderStatus: 'cancelled',
        orderId: 'ord-1',
      }),
    ).toBe(false);
    expect(
      shouldHandoffToThankYou({
        status: 'refunded',
        orderStatus: 'refunded',
        orderId: 'ord-1',
      }),
    ).toBe(false);
  });

  it('persists completed order id in sessionStorage', () => {
    markPaymentOrderCompleted('ord-1');
    expect(getCompletedPaymentOrderId()).toBe('ord-1');
    expect(isPaymentOrderCompletedInSession('ord-1')).toBe(true);
    expect(isPaymentOrderCompletedInSession('ord-2')).toBe(false);
  });
});
