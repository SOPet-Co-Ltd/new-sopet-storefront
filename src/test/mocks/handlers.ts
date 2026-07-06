import { graphql, HttpResponse } from 'msw';
import {
  defaultProductsPagination,
  sampleCategories,
  samplePlatformBanners,
  samplePlatformSettings,
  sampleProductCard,
  sampleProductDetail,
  sampleProductReview,
  sampleStore,
  sampleStoreReviewSummary,
} from './fixtures/catalog';
import { sampleCart, sampleEmptyCart } from './fixtures/cart';
import {
  sampleOrder,
  samplePaidPayment,
  samplePendingPayment,
  samplePromotionValidation,
  sampleSavedAddress,
  sampleShippingOption,
} from './fixtures/checkout';

/**
 * Default MSW handlers for Vitest. Phase-specific handlers are added per test
 * via `server.use()` or extended in feature-scoped handler modules.
 */
export const handlers = [
  graphql.query('Me', () => {
    return HttpResponse.json({
      data: {
        me: {
          customer: null,
        },
      },
    });
  }),

  graphql.query('Products', () => {
    return HttpResponse.json({
      data: {
        products: {
          items: [sampleProductCard],
          pagination: defaultProductsPagination,
        },
      },
    });
  }),

  graphql.query('ProductBySlug', () => {
    return HttpResponse.json({
      data: { productBySlug: sampleProductDetail },
    });
  }),

  graphql.query('ProductById', () => {
    return HttpResponse.json({
      data: { product: sampleProductDetail },
    });
  }),

  graphql.query('ApprovedCategories', () => {
    return HttpResponse.json({
      data: { approvedCategories: sampleCategories },
    });
  }),

  graphql.query('StoreBySlug', () => {
    return HttpResponse.json({
      data: { storeBySlug: sampleStore },
    });
  }),

  graphql.query('ProductReviews', () => {
    return HttpResponse.json({
      data: { productReviews: [sampleProductReview] },
    });
  }),

  graphql.query('StoreReviewSummary', () => {
    return HttpResponse.json({
      data: { storeReviewSummary: sampleStoreReviewSummary },
    });
  }),

  graphql.query('PlatformBanners', () => {
    return HttpResponse.json({
      data: { platformBanners: samplePlatformBanners },
    });
  }),

  graphql.query('PlatformAds', () => {
    return HttpResponse.json({
      data: { platformAds: [] },
    });
  }),

  graphql.query('PlatformSponsors', () => {
    return HttpResponse.json({
      data: { platformSponsors: [] },
    });
  }),

  graphql.query('PlatformSettings', () => {
    return HttpResponse.json({
      data: { platformSettings: samplePlatformSettings },
    });
  }),

  graphql.query('Cart', () => {
    return HttpResponse.json({
      data: { cart: sampleEmptyCart },
    });
  }),

  graphql.mutation('AddToCart', () => {
    return HttpResponse.json({
      data: { addToCart: sampleCart },
    });
  }),

  graphql.mutation('UpdateCartItem', () => {
    return HttpResponse.json({
      data: { updateCartItem: sampleCart },
    });
  }),

  graphql.mutation('RemoveCartItem', () => {
    return HttpResponse.json({
      data: { removeCartItem: sampleEmptyCart },
    });
  }),

  graphql.mutation('MergeCart', () => {
    return HttpResponse.json({
      data: { mergeCart: sampleCart },
    });
  }),

  graphql.query('Addresses', () => {
    return HttpResponse.json({
      data: { addresses: [sampleSavedAddress] },
    });
  }),

  graphql.mutation('CreateAddress', () => {
    return HttpResponse.json({
      data: { createAddress: sampleSavedAddress },
    });
  }),

  graphql.mutation('UpdateAddress', () => {
    return HttpResponse.json({
      data: { updateAddress: sampleSavedAddress },
    });
  }),

  graphql.mutation('DeleteAddress', () => {
    return HttpResponse.json({
      data: { deleteAddress: true },
    });
  }),

  graphql.mutation('SetDefaultAddress', () => {
    return HttpResponse.json({
      data: { setDefaultAddress: sampleSavedAddress },
    });
  }),

  graphql.query('StoreShippingOptions', () => {
    return HttpResponse.json({
      data: { storeShippingOptions: [sampleShippingOption] },
    });
  }),

  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({
      data: { validatePromotion: samplePromotionValidation },
    });
  }),

  graphql.mutation('CreateOrder', () => {
    return HttpResponse.json({
      data: { createOrder: sampleOrder },
    });
  }),

  graphql.mutation('CreatePayment', () => {
    return HttpResponse.json({
      data: { createPayment: samplePendingPayment },
    });
  }),

  graphql.query('Payment', () => {
    return HttpResponse.json({
      data: { payment: samplePendingPayment },
    });
  }),

  graphql.query('PaymentByOrderId', () => {
    return HttpResponse.json({
      data: { paymentByOrderId: samplePendingPayment },
    });
  }),
];
