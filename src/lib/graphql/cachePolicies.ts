import type { TypePolicies } from '@apollo/client';

export const typePolicies: TypePolicies = {
  ProductType: {
    keyFields: ['id'],
  },
  Query: {
    fields: {
      me: {
        merge: (_existing, incoming) => incoming,
      },
      cart: {
        merge: (_existing, incoming) => incoming,
      },
      // Parallel auto-apply / two store modals must not share one catalog slot.
      activeStorePromotions: {
        keyArgs: ['storeId'],
      },
      storeShippingOptions: {
        keyArgs: ['storeId'],
      },
      validatePromotion: {
        keyArgs: ['input'],
      },
    },
  },
};
