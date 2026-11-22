import { describe, expect, it } from 'vitest';
import {
  getCheckoutCardFieldErrors,
  validateCheckoutCardForm,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';

describe('checkoutCardPaymentBridge inline validation', () => {
  const validForm = {
    cardNumber: '4242-4242-4242-4242',
    cardName: 'Test User',
    expiry: '12/30',
    cvv: '123',
  };

  it('flags invalid Luhn card number when complete', () => {
    const form = { ...validForm, cardNumber: '4242-4242-4242-4241' };
    expect(getCheckoutCardFieldErrors(form).cardNumber).toBe('หมายเลขบัตรไม่ถูกต้อง');
    expect(validateCheckoutCardForm(form)).toBe('หมายเลขบัตรไม่ถูกต้อง');
  });

  it('flags expired expiry when MM/YY is complete', () => {
    const form = { ...validForm, expiry: '01/20' };
    expect(getCheckoutCardFieldErrors(form).expiry).toBe('บัตรหมดอายุแล้ว กรุณาใช้บัตรอื่น');
    expect(validateCheckoutCardForm(form)).toBe('บัตรหมดอายุแล้ว กรุณาใช้บัตรอื่น');
  });

  it('flags short CVV when digits present', () => {
    const form = { ...validForm, cvv: '12' };
    expect(getCheckoutCardFieldErrors(form).cvv).toBe('กรุณากรอกรหัส CVV 3 หลัก');
    expect(validateCheckoutCardForm(form)).toBe('กรุณากรอกรหัส CVV 3 หลัก');
  });

  it('accepts valid card form', () => {
    expect(getCheckoutCardFieldErrors(validForm)).toEqual({});
    expect(validateCheckoutCardForm(validForm)).toBeNull();
  });
});
