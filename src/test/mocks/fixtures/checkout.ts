export const CHECKOUT_STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
export const CHECKOUT_PAYMENT_ID = 'payment-checkout-1';
export const CHECKOUT_ORDER_ID = 'order-checkout-1';

export const sampleSavedAddress = {
  __typename: 'SavedAddressType' as const,
  id: 'addr-1',
  fullName: 'สมชาย ใจดี',
  phone: '0812345678',
  addressLine1: '123 ถนนสุขุมวิท',
  addressLine2: null,
  amphoe: 'วัฒนา',
  tumbon: 'คลองตัน',
  province: 'กรุงเทพมหานคร',
  postalCode: '10110',
  label: 'บ้าน',
  isDefault: true,
};

export const sampleShippingOption = {
  __typename: 'StoreShippingOptionType' as const,
  id: 'ship-opt-1',
  storeId: CHECKOUT_STORE_ID,
  name: 'จัดส่งมาตรฐาน',
  description: '3-5 วันทำการ',
  price: 50,
  isActive: true,
  sortOrder: 1,
  providerId: null,
};

export const samplePromotionValidation = {
  __typename: 'PromotionValidationResult' as const,
  code: 'SAVE10',
  name: 'ลด 10 บาท',
  discountAmount: 10,
};

export const sampleOrder = {
  __typename: 'OrderType' as const,
  id: CHECKOUT_ORDER_ID,
  orderNumber: 'ORD-1001',
  status: 'pending_payment',
  createdAt: '2026-07-06T10:00:00.000Z',
  paymentMethod: 'promptpay',
  subtotal: 500,
  shippingFee: 50,
  discountAmount: 10,
  total: 540,
  guestEmail: null,
  guestName: null,
  guestPhone: null,
  items: [
    {
      __typename: 'OrderItemType' as const,
      id: 'order-item-1',
      variantId: 'variant-1',
      storeId: CHECKOUT_STORE_ID,
      productName: 'Premium Dog Food 5kg',
      quantity: 1,
      unitPrice: 500,
      subtotal: 500,
      fulfillmentStatus: 'pending',
    },
  ],
  storeShippings: [
    {
      __typename: 'OrderStoreShippingType' as const,
      storeId: CHECKOUT_STORE_ID,
      optionName: 'จัดส่งมาตรฐาน',
      shippingFee: 50,
    },
  ],
  shippingAddress: {
    __typename: 'OrderShippingAddressType' as const,
    fullName: sampleSavedAddress.fullName,
    phone: sampleSavedAddress.phone,
    addressLine1: sampleSavedAddress.addressLine1,
    addressLine2: sampleSavedAddress.addressLine2,
    amphoe: sampleSavedAddress.amphoe,
    tumbon: sampleSavedAddress.tumbon,
    province: sampleSavedAddress.province,
    postalCode: sampleSavedAddress.postalCode,
  },
};

export const samplePendingPayment = {
  __typename: 'PaymentType' as const,
  id: CHECKOUT_PAYMENT_ID,
  orderId: CHECKOUT_ORDER_ID,
  amount: 540,
  currency: 'THB',
  status: 'pending',
  paymentMethod: 'promptpay',
  authorizeUri: null,
  qrCodeUrl: 'https://example.com/qr.png',
};

export const samplePaidPayment = {
  ...samplePendingPayment,
  status: 'paid',
};
