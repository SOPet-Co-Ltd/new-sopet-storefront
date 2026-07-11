import { describe, expect, it } from 'vitest';
import { formatCvv, getCvvLength, getCvvPlaceholder, isValidCvv } from './paymentFormat';

describe('paymentFormat CVV helpers', () => {
  it('uses 3 digits for Visa and Mastercard', () => {
    expect(getCvvLength('4242-4242-4242-4242')).toBe(3);
    expect(getCvvLength('5555-5555-5555-4444')).toBe(3);
    expect(getCvvPlaceholder('4242-4242-4242-4242')).toBe('***');
  });

  it('uses 4 digits for American Express', () => {
    expect(getCvvLength('3782-822463-10005')).toBe(4);
    expect(getCvvLength('3714-496353-98431')).toBe(4);
    expect(getCvvPlaceholder('3782-822463-10005')).toBe('****');
  });

  it('formats CVV to the correct max length', () => {
    expect(formatCvv('12345', '4242-4242-4242-4242')).toBe('123');
    expect(formatCvv('12345', '3782-822463-10005')).toBe('1234');
  });

  it('validates CVV length based on card brand', () => {
    expect(isValidCvv('123', '4242-4242-4242-4242')).toBe(true);
    expect(isValidCvv('12', '4242-4242-4242-4242')).toBe(false);
    expect(isValidCvv('1234', '4242-4242-4242-4242')).toBe(false);

    expect(isValidCvv('1234', '3782-822463-10005')).toBe(true);
    expect(isValidCvv('123', '3782-822463-10005')).toBe(false);
  });
});
