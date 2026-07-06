import { describe, expect, it } from 'vitest';
import { CATALOG_PRODUCT_ID, CATALOG_STORE_ID } from '@/test/mocks/fixtures/catalog';
import { sampleCart, sampleCartItem } from '@/test/mocks/fixtures/cart';
import type { CartType } from '@/lib/graphql/generated/graphql';
import {
  toCreateOrderInput,
  validateGuestCheckoutForm,
  type CreateOrderCheckoutContext,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';

const SHIPPING_OPTION_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const SAVED_ADDRESS_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef0';

const validGuestForm: GuestCheckoutFormState = {
  contactPhone: '0812345678',
  recipientFullName: 'Somchai',
  recipientPhone: '0812345678',
  address: '123 Sukhumvit',
  district: 'Khlong Toei',
  province: 'Bangkok',
  postalCode: '10110',
};

const guestCheckoutContext: CreateOrderCheckoutContext = {
  isAuthenticated: false,
  shippingByStoreId: {
    [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
  },
  selectedAddressId: null,
  promotionCode: null,
  paymentMethod: 'promptpay',
};

const authenticatedCheckoutContext: CreateOrderCheckoutContext = {
  isAuthenticated: true,
  shippingByStoreId: {
    [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
  },
  selectedAddressId: SAVED_ADDRESS_ID,
  promotionCode: 'SAVE10',
  paymentMethod: 'promptpay',
};

describe('validateGuestCheckoutForm', () => {
  it('returns a Thai error when guestPhone is missing', () => {
    const result = validateGuestCheckoutForm({
      ...validGuestForm,
      contactPhone: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.guestPhone).toBe('กรุณากรอกเบอร์โทรศัพท์ของคุณ');
  });

  it('returns a Thai error when guestPhone format is invalid', () => {
    const result = validateGuestCheckoutForm({
      ...validGuestForm,
      contactPhone: '12345',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.guestPhone).toBe('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
  });
});

describe('toCreateOrderInput', () => {
  it('maps a valid guest payload to CreateOrderInput', () => {
    const input = toCreateOrderInput(validGuestForm, sampleCart, guestCheckoutContext);

    expect(input).toEqual({
      guestPhone: '+66812345678',
      guestName: 'Somchai',
      items: [
        {
          productId: CATALOG_PRODUCT_ID,
          variantId: sampleCartItem.variantId,
          quantity: sampleCartItem.quantity,
          price: sampleCartItem.productVariant?.price,
        },
      ],
      paymentMethod: 'promptpay',
      shippingAddress: {
        recipientName: 'Somchai',
        recipientPhone: '+66812345678',
        addressLine1: '123 Sukhumvit',
        amphoe: 'Khlong Toei',
        province: 'Bangkok',
        postalCode: '10110',
      },
      storeShipping: [
        {
          storeId: CATALOG_STORE_ID,
          shippingOptionId: SHIPPING_OPTION_ID,
        },
      ],
    });
  });

  it('omits guest fields and uses savedAddressId for authenticated checkout', () => {
    const input = toCreateOrderInput(null, sampleCart, authenticatedCheckoutContext);

    expect(input.guestPhone).toBeUndefined();
    expect(input.guestName).toBeUndefined();
    expect(input.guestEmail).toBeUndefined();
    expect(input.shippingAddress).toBeUndefined();
    expect(input.savedAddressId).toBe(SAVED_ADDRESS_ID);
    expect(input.platformPromotionCode).toBe('SAVE10');
    expect(input.items).toHaveLength(1);
    expect(input.storeShipping).toEqual([
      {
        storeId: CATALOG_STORE_ID,
        shippingOptionId: SHIPPING_OPTION_ID,
      },
    ]);
  });

  it('maps storeShipping for every store in shippingByStoreId', () => {
    const secondStoreId = 'd3c4b5a6-7890-4abc-def1-234567890abc';
    const secondShippingOptionId = 'e4d5c6b7-8901-4bcd-ef12-345678901bcd';

    const multiStoreCart: CartType = {
      ...sampleCart,
      items: [
        sampleCartItem,
        {
          ...sampleCartItem,
          id: 'cart-item-2',
          productVariant: sampleCartItem.productVariant
            ? {
                ...sampleCartItem.productVariant,
                product: sampleCartItem.productVariant.product
                  ? {
                      ...sampleCartItem.productVariant.product,
                      storeId: secondStoreId,
                    }
                  : null,
              }
            : null,
        },
      ],
    };

    const input = toCreateOrderInput(validGuestForm, multiStoreCart, {
      ...guestCheckoutContext,
      shippingByStoreId: {
        [CATALOG_STORE_ID]: { shippingOptionId: SHIPPING_OPTION_ID },
        [secondStoreId]: { shippingOptionId: secondShippingOptionId },
      },
    });

    expect(input.storeShipping).toEqual(
      expect.arrayContaining([
        { storeId: CATALOG_STORE_ID, shippingOptionId: SHIPPING_OPTION_ID },
        { storeId: secondStoreId, shippingOptionId: secondShippingOptionId },
      ]),
    );
    expect(input.storeShipping).toHaveLength(2);
  });
});
