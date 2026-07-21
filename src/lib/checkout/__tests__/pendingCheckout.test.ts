import { afterEach, describe, expect, it } from 'vitest';
import {
  clearPendingCheckout,
  getPendingCheckout,
  setPendingCheckout,
} from '@/lib/checkout/pendingCheckout';

describe('pendingCheckout', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores and clears pending checkout payment', () => {
    setPendingCheckout({ paymentId: 'pay-1', orderId: 'ord-1' });
    expect(getPendingCheckout()).toEqual({ paymentId: 'pay-1', orderId: 'ord-1' });

    clearPendingCheckout();
    expect(getPendingCheckout()).toBeNull();
  });
});
