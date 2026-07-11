# Hooks

Data hooks live in `src/lib/hooks/` (37 files).

## Pattern

```typescript
'use client';

import { useQuery } from '@apollo/client/react';
import {
  ProductsDocument,
  type ProductsQuery,
  type ProductsQueryVariables,
} from '@/lib/graphql/generated/graphql';

export interface UseProductsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UseProductsResult {
  products: ProductsQuery['products']['items'];
  loading: boolean;
  error: Error | undefined;
  fetchMore: () => void;
}

export function useProducts(params: UseProductsParams): UseProductsResult {
  const variables = buildProductsListingVariables(params);
  const { data, loading, error, fetchMore } = useQuery(ProductsDocument, {
    variables,
    skip: !params.category && !params.search,
  });
  // map and return typed result
}
```

## Conventions

| Rule      | Detail                                    |
| --------- | ----------------------------------------- |
| Location  | `src/lib/hooks/use*.ts`                   |
| Directive | `'use client'` at top                     |
| Imports   | `*Document` from `generated/graphql`      |
| Types     | Derive from query/mutation types          |
| Errors    | `toHookError()` helper for Apollo errors  |
| Tests     | Co-located in `__tests__/` or `*.test.ts` |

## Hook categories

| Category | Examples                                                                 |
| -------- | ------------------------------------------------------------------------ |
| Catalog  | `useProducts`, `useProduct`, `useSearchSuggestions`                      |
| Account  | `useOrders`, `useAddresses`, `useFavorites`, `useProfile`, `useDisputes` |
| Auth     | `useAuth` (context wrapper)                                              |
| Checkout | `useCheckout`, `useCheckoutTotals`, `usePayment`                         |
| Search   | `useSearchContext`, `useRecentSearches`, `useNavbarSearchCombobox`       |
| Reviews  | `useReviews`, `useCustomerReviews`                                       |

## Auth hook exception

`useAuth.ts` wraps `AuthContext` — does not call Apollo directly:

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/lib/providers/AuthProvider';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### `useDisputes`

Customer return requests via `MyDisputesDocument` / `CreateDisputesDocument`.

- `createDisputes` refetches `MyDisputes`, `Orders`, and `Order` (for the submitted `orderId`) so list badges stay current.
- Pair with `useOrdersDisputeStatus` on the order list for per-order return badges.

See [workspace returns-and-disputes](../../new-sopet-workspace/docs/developer/returns-and-disputes.md).

## Testing hooks

```typescript
// src/lib/hooks/__tests__/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

const wrapper = ({ children }) => (
  <MockedProvider mocks={mocks}>{children}</MockedProvider>
);

const { result } = renderHook(() => useProducts({ category: 'dog' }), { wrapper });
```

Or use MSW handlers from `src/test/mocks/handlers.ts`.

## Related docs

- [GraphQL](graphql.md)
- [State management](state-management.md)
