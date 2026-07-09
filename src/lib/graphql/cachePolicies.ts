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
    },
  },
};
