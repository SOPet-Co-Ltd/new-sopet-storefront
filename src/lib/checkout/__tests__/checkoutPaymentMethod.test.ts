import { describe, expect, it } from 'vitest';
import { mapCheckoutPaymentMethodForApi } from '@/lib/checkout/checkoutPaymentMethod';

describe('mapCheckoutPaymentMethodForApi', () => {
  it('maps card to credit_card', () => {
    expect(mapCheckoutPaymentMethodForApi('card')).toBe('credit_card');
  });

  it('passes through supported API values', () => {
    expect(mapCheckoutPaymentMethodForApi('promptpay')).toBe('promptpay');
    expect(mapCheckoutPaymentMethodForApi('credit_card')).toBe('credit_card');
    expect(mapCheckoutPaymentMethodForApi('cod')).toBe('cod');
  });
});
