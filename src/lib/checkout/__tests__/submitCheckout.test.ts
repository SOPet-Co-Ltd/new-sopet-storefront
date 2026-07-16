import { renderHook } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useCheckout } from '@/lib/hooks/useCheckout';
import { server } from '@/test/mocks/server';
import { CATALOG_STORE_ID } from '@/test/mocks/fixtures/catalog';
import { sampleCart } from '@/test/mocks/fixtures/cart';
import {
  CHECKOUT_ORDER_ID,
  CHECKOUT_PAYMENT_ID,
  sampleOrder,
  samplePendingPayment,
  samplePromotionValidation,
} from '@/test/mocks/fixtures/checkout';
import {
  createSubmitCheckoutGuard,
  submitCheckout,
  SubmitCheckoutError,
  type SubmitCheckoutParams,
} from '@/lib/checkout/submitCheckout';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';

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

function createCheckoutHook(overrides?: Partial<SubmitCheckoutParams['checkoutHook']>) {
  return {
    validatePromotion: vi.fn().mockResolvedValue(samplePromotionValidation),
    createOrder: vi.fn().mockResolvedValue(sampleOrder),
    createPayment: vi.fn().mockResolvedValue(samplePendingPayment),
    ...overrides,
  };
}

function createSubmitParams(overrides?: Partial<SubmitCheckoutParams>): SubmitCheckoutParams {
  return {
    step: 'review',
    checkoutContext: {
      isAuthenticated: false,
      shippingByStoreId: {
        [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
      },
      selectedAddressId: null,
      promotionCode: null,
      storePromotionCodes: [],
      paymentMethod: 'promptpay',
    },
    cart: sampleCart,
    guestForm,
    subtotal: 890,
    checkoutHook: createCheckoutHook(),
    ...overrides,
  };
}

describe('submitCheckout', () => {
  it('blocks createOrder when step is shipping', async () => {
    const checkoutHook = createCheckoutHook();
    const params = createSubmitParams({ step: 'shipping', checkoutHook });

    await expect(submitCheckout(params)).rejects.toMatchObject({
      code: 'invalid_step',
    });

    expect(checkoutHook.createOrder).not.toHaveBeenCalled();
    expect(checkoutHook.createPayment).not.toHaveBeenCalled();
  });

  it('blocks createOrder when step is payment', async () => {
    const checkoutHook = createCheckoutHook();
    const params = createSubmitParams({ step: 'payment', checkoutHook });

    await expect(submitCheckout(params)).rejects.toMatchObject({
      code: 'invalid_step',
    });

    expect(checkoutHook.createOrder).not.toHaveBeenCalled();
  });

  it('runs validatePromotion, createOrder, and createPayment in order on review step', async () => {
    const validatePromotion = vi.fn().mockResolvedValue(samplePromotionValidation);
    const createOrder = vi.fn().mockResolvedValue(sampleOrder);
    const createPayment = vi.fn().mockResolvedValue(samplePendingPayment);
    const callOrder: string[] = [];

    validatePromotion.mockImplementation(async () => {
      callOrder.push('validatePromotion');
      return samplePromotionValidation;
    });
    createOrder.mockImplementation(async () => {
      callOrder.push('createOrder');
      return sampleOrder;
    });
    createPayment.mockImplementation(async () => {
      callOrder.push('createPayment');
      return samplePendingPayment;
    });

    const params = createSubmitParams({
      checkoutContext: {
        isAuthenticated: false,
        shippingByStoreId: {
          [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
        },
        selectedAddressId: null,
        promotionCode: 'SAVE10',
        storePromotionCodes: [],
        paymentMethod: 'promptpay',
      },
      checkoutHook: {
        validatePromotion,
        createOrder,
        createPayment,
      },
    });

    const result = await submitCheckout(params, createSubmitCheckoutGuard());

    expect(callOrder).toEqual(['validatePromotion', 'createOrder', 'createPayment']);
    expect(validatePromotion).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SAVE10',
        subtotal: 890,
        lines: expect.arrayContaining([
          expect.objectContaining({
            productId: expect.any(String),
            quantity: expect.any(Number),
            unitPrice: expect.any(Number),
          }),
        ]),
      }),
    );
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createPayment).toHaveBeenCalledWith({
      orderId: CHECKOUT_ORDER_ID,
      amount: sampleOrder.total,
      paymentMethod: 'promptpay',
      currency: 'THB',
    });
    expect(result).toEqual({
      redirectPath: `/payment/${CHECKOUT_PAYMENT_ID}`,
      paymentId: CHECKOUT_PAYMENT_ID,
      orderId: CHECKOUT_ORDER_ID,
    });
  });

  it('skips validatePromotion when no promotion code is set', async () => {
    const checkoutHook = createCheckoutHook();

    await submitCheckout(createSubmitParams({ checkoutHook }), createSubmitCheckoutGuard());

    expect(checkoutHook.validatePromotion).not.toHaveBeenCalled();
    expect(checkoutHook.createOrder).toHaveBeenCalledTimes(1);
    expect(checkoutHook.createPayment).toHaveBeenCalledTimes(1);
  });

  it('does not call createOrder when promotion validation fails', async () => {
    const checkoutHook = createCheckoutHook({
      validatePromotion: vi.fn().mockResolvedValue(undefined),
    });

    const params = createSubmitParams({
      checkoutContext: {
        isAuthenticated: false,
        shippingByStoreId: {
          [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
        },
        selectedAddressId: null,
        promotionCode: 'INVALID',
        storePromotionCodes: [],
        paymentMethod: 'promptpay',
      },
      checkoutHook,
    });

    await expect(submitCheckout(params)).rejects.toMatchObject({
      code: 'promotion_invalid',
    });

    expect(checkoutHook.createOrder).not.toHaveBeenCalled();
    expect(checkoutHook.createPayment).not.toHaveBeenCalled();
  });

  it('deduplicates rapid duplicate submit calls', async () => {
    let createOrderCalls = 0;
    const checkoutHook = createCheckoutHook({
      createOrder: vi.fn().mockImplementation(async () => {
        createOrderCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return sampleOrder;
      }),
    });
    const guard = createSubmitCheckoutGuard();
    const params = createSubmitParams({ checkoutHook });

    const [first, second] = await Promise.all([
      submitCheckout(params, guard),
      submitCheckout(params, guard),
    ]);

    expect(createOrderCalls).toBe(1);
    expect(first.redirectPath).toBe(second.redirectPath);
  });

  it('passes omiseToken for card payments and skips it for COD', async () => {
    const createPayment = vi.fn().mockResolvedValue(samplePendingPayment);

    await submitCheckout(
      createSubmitParams({
        checkoutContext: {
          isAuthenticated: false,
          shippingByStoreId: {
            [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
          },
          selectedAddressId: null,
          promotionCode: null,
          storePromotionCodes: [],
          paymentMethod: 'card',
        },
        omiseToken: 'tokn_test_123',
        checkoutHook: createCheckoutHook({ createPayment }),
      }),
      createSubmitCheckoutGuard(),
    );

    expect(createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: 'credit_card',
        omiseToken: 'tokn_test_123',
      }),
    );

    createPayment.mockClear();

    await submitCheckout(
      createSubmitParams({
        checkoutContext: {
          isAuthenticated: false,
          shippingByStoreId: {
            [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
          },
          selectedAddressId: null,
          promotionCode: null,
          storePromotionCodes: [],
          paymentMethod: 'cod',
        },
        omiseToken: 'tokn_test_123',
        checkoutHook: createCheckoutHook({ createPayment }),
      }),
      createSubmitCheckoutGuard(),
    );

    expect(createPayment).toHaveBeenCalledWith(
      expect.not.objectContaining({
        omiseToken: expect.anything(),
      }),
    );
  });

  it('throws SubmitCheckoutError for invalid step', async () => {
    await expect(submitCheckout(createSubmitParams({ step: 'shipping' }))).rejects.toBeInstanceOf(
      SubmitCheckoutError,
    );
  });
});

const createApolloWrapper = createApolloTestWrapper;

describe('submitCheckout MSW integration', () => {
  it('submits checkout end-to-end using useCheckout with MSW handlers', async () => {
    server.use(
      graphql.query('ValidatePromotion', ({ variables }) => {
        expect(variables).toMatchObject({
          input: { code: 'SAVE10', subtotal: 890 },
        });
        return HttpResponse.json({
          data: { validatePromotion: samplePromotionValidation },
        });
      }),
      graphql.mutation('CreateOrder', () =>
        HttpResponse.json({ data: { createOrder: sampleOrder } }),
      ),
      graphql.mutation('CreatePayment', () =>
        HttpResponse.json({ data: { createPayment: samplePendingPayment } }),
      ),
    );

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createApolloWrapper(),
    });

    const params = createSubmitParams({
      checkoutContext: {
        isAuthenticated: false,
        shippingByStoreId: {
          [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
        },
        selectedAddressId: null,
        promotionCode: 'SAVE10',
        storePromotionCodes: [],
        paymentMethod: 'promptpay',
      },
      checkoutHook: {
        validatePromotion: result.current.validatePromotion,
        createOrder: result.current.createOrder,
        createPayment: result.current.createPayment,
      },
    });

    const submitResult = await submitCheckout(params, createSubmitCheckoutGuard());

    expect(submitResult).toEqual({
      redirectPath: `/payment/${CHECKOUT_PAYMENT_ID}`,
      paymentId: CHECKOUT_PAYMENT_ID,
      orderId: CHECKOUT_ORDER_ID,
    });
  });
});
