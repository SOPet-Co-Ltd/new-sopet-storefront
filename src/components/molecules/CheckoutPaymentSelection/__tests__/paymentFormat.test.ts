import { describe, expect, it } from 'vitest';
import {
  isExpiryDateValid,
  isValidCardNumberLuhn,
  passesLuhnCheck,
} from '@/components/molecules/CheckoutPaymentSelection/paymentFormat';

describe('paymentFormat card helpers', () => {
  it('validates Luhn for Visa test PAN', () => {
    expect(passesLuhnCheck('4242424242424242')).toBe(true);
    expect(isValidCardNumberLuhn('4242-4242-4242-4242')).toBe(true);
    expect(isValidCardNumberLuhn('4242-4242-4242-4241')).toBe(false);
  });

  it('rejects expiry before reference date', () => {
    expect(isExpiryDateValid('01/20', new Date('2026-06-01T00:00:00Z'))).toBe(false);
    expect(isExpiryDateValid('12/30', new Date('2026-06-01T00:00:00Z'))).toBe(true);
  });
});
