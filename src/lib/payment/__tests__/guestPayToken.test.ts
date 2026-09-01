import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearGuestPayToken,
  persistGuestPayToken,
  readGuestPayToken,
  resolveGuestPayToken,
} from '@/lib/payment/guestPayToken';

describe('guestPayToken session helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('persists and reads by order id and payment id', () => {
    persistGuestPayToken({
      orderId: 'ord-1',
      paymentId: 'pay-1',
      token: 'abc123',
    });

    expect(readGuestPayToken('ord-1')).toBe('abc123');
    expect(readGuestPayToken('pay-1')).toBe('abc123');
  });

  it('resolveGuestPayToken prefers explicit token then storage keys', () => {
    persistGuestPayToken({ orderId: 'ord-1', token: 'stored' });

    expect(resolveGuestPayToken({ guestPayToken: 'explicit', orderId: 'ord-1' })).toBe('explicit');
    expect(resolveGuestPayToken({ orderId: 'ord-1' })).toBe('stored');
    expect(resolveGuestPayToken({ paymentId: 'missing', orderId: 'ord-1' })).toBe('stored');
  });

  it('clearGuestPayToken removes a key', () => {
    persistGuestPayToken({ orderId: 'ord-1', token: 'x' });
    clearGuestPayToken('ord-1');
    expect(readGuestPayToken('ord-1')).toBeNull();
  });

  it('tolerates sessionStorage failures', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => persistGuestPayToken({ orderId: 'ord-1', token: 'x' })).not.toThrow();
    setSpy.mockRestore();
  });
});
