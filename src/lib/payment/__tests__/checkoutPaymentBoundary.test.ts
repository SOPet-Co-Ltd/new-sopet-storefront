import { describe, expect, it, vi } from 'vitest';
import { submitCheckout, type SubmitCheckoutParams } from '@/lib/checkout/submitCheckout';
import { CATALOG_STORE_ID } from '@/test/mocks/fixtures/catalog';
import { sampleCart } from '@/test/mocks/fixtures/cart';
import {
  sampleOrder,
  samplePendingPayment,
} from '@/test/mocks/fixtures/checkout';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';

vi.mock('@/lib/payment/omise', () => ({
  tokenizeCard: vi.fn(),
}));

vi.mock('@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge', () => ({
  prepareCardPaymentToken: vi.fn(),
}));

import { tokenizeCard } from '@/lib/payment/omise';
import { prepareCardPaymentToken } from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';

const SHIPPING_OPTION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

const guestForm: GuestCheckoutFormState = {
  contactPhone: '0812345678',
  recipientFullName: 'Somchai',
  recipientPhone: '0812345678',
  address: '123 Sukhumvit',
  district: 'Khlong Toei',
  province: 'Bangkok',
  postalCode: '10110',
};

function createSubmitParams(
  paymentMethod: 'promptpay' | 'card' | 'cod',
): SubmitCheckoutParams {
  return {
    step: 'review',
    checkoutContext: {
      isAuthenticated: false,
      shippingByStoreId: {
        [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
      },
      selectedAddressId: null,
      promotionCode: null,
      paymentMethod,
    },
    cart: sampleCart,
    guestForm,
    subtotal: 890,
    checkoutHook: {
      validatePromotion: vi.fn(),
      createOrder: vi.fn().mockResolvedValue(sampleOrder),
      createPayment: vi.fn().mockResolvedValue(samplePendingPayment),
    },
  };
}

describe('submitCheckout payment method boundaries', () => {
  it('includes omiseToken for card payments when provided', async () => {
    const params = createSubmitParams('card');
    params.omiseToken = 'tokn_test_123';

    await submitCheckout(params);

    expect(params.checkoutHook.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: 'card',
        omiseToken: 'tokn_test_123',
      }),
    );
    expect(tokenizeCard).not.toHaveBeenCalled();
  });

  it('does not call tokenizeCard for promptpay or cod paths', async () => {
    vi.mocked(prepareCardPaymentToken).mockResolvedValue('tokn_test_123');

    await submitCheckout(createSubmitParams('promptpay'));
    await submitCheckout(createSubmitParams('cod'));

    expect(tokenizeCard).not.toHaveBeenCalled();
    expect(prepareCardPaymentToken).not.toHaveBeenCalled();
  });
});
