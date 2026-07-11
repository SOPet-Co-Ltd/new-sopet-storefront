import { graphql, HttpResponse } from 'msw';
import {
  defaultProductsPagination,
  sampleBrands,
  sampleCategories,
  samplePetTypes,
  samplePlatformBanners,
  samplePlatformSettings,
  sampleProductCard,
  sampleProductDetail,
  sampleProductReview,
  sampleStore,
  sampleStoreReview,
  sampleStoreReviewSummary,
} from './fixtures/catalog';
import { sampleCart, sampleEmptyCart } from './fixtures/cart';
import { sampleSearchRecoverySuggestions, sampleSearchSuggestionsPayload } from './fixtures/search';
import {
  sampleOrder,
  samplePendingPayment,
  samplePromotionValidation,
  sampleSavedAddress,
  sampleShippingOption,
  sampleStorePromotion,
  samplePlatformPromotion,
} from './fixtures/checkout';
import {
  sampleFavorite,
  sampleMyReview,
  samplePaymentMethod,
  sampleReviewableItem,
} from './fixtures/account';

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

  graphql.query('SearchSuggestions', () => {
    return HttpResponse.json({
      data: {
        searchSuggestions: sampleSearchSuggestionsPayload,
      },
    });
  }),

  graphql.query('SearchRecoverySuggestions', () => {
    return HttpResponse.json({
      data: {
        searchRecoverySuggestions: sampleSearchRecoverySuggestions,
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

  graphql.query('ApprovedPetTypes', () => {
    return HttpResponse.json({
      data: { approvedPetTypes: samplePetTypes },
    });
  }),

  graphql.query('ApprovedBrands', () => {
    return HttpResponse.json({
      data: { approvedBrands: sampleBrands },
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

  graphql.query('StoreReviews', () => {
    return HttpResponse.json({
      data: { storeReviews: [sampleStoreReview] },
    });
  }),

  graphql.query('StoreReviewSummary', () => {
    return HttpResponse.json({
      data: { storeReviewSummary: sampleStoreReviewSummary },
    });
  }),

  graphql.query('CustomerReviewableItems', () => {
    return HttpResponse.json({
      data: { customerReviewableItems: [sampleReviewableItem] },
    });
  }),

  graphql.query('MyReviews', () => {
    return HttpResponse.json({
      data: { myReviews: [sampleMyReview] },
    });
  }),

  graphql.mutation('CreateReview', () => {
    return HttpResponse.json({
      data: {
        createReview: {
          id: 'review-new',
          productId: sampleMyReview.productId,
          rating: 5,
          comment: 'Great',
          status: 'approved',
          createdAt: new Date().toISOString(),
          customerName: 'ลูกค้า',
        },
      },
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
      data: { addresses: [] },
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

  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: { activeStorePromotions: [sampleStorePromotion] },
    });
  }),

  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [samplePlatformPromotion] },
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

  graphql.query('Order', ({ variables }) => {
    return HttpResponse.json({
      data: {
        order: {
          ...sampleOrder,
          id: variables.id ?? sampleOrder.id,
        },
      },
    });
  }),

  graphql.query('Orders', ({ variables }) => {
    const page = variables?.page ?? 1;
    const limit = variables?.limit ?? 10;

    return HttpResponse.json({
      data: {
        orders: {
          items: [sampleOrder],
          pagination: {
            page,
            limit,
            total: 1,
            totalPages: 1,
          },
        },
      },
    });
  }),

  graphql.query('Favorites', () => {
    return HttpResponse.json({
      data: { favorites: [sampleFavorite] },
    });
  }),

  graphql.query('PaymentMethods', () => {
    return HttpResponse.json({
      data: { paymentMethods: [samplePaymentMethod] },
    });
  }),

  graphql.mutation('UpdateProfile', () => {
    return HttpResponse.json({
      data: {
        updateProfile: {
          id: 'cust-1',
          phone: '0812345678',
          email: 'user@example.com',
          fullName: 'สมชาย ใจดี',
        },
      },
    });
  }),
];
