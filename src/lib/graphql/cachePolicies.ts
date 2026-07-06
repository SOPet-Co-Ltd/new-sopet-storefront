import type { TypePolicies } from '@apollo/client';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      me: {
        merge: (_existing, incoming) => incoming,
      },
    },
  },
};
