# Hooks

Data hooks live in `src/lib/hooks/` (30 files). A separate, non-GraphQL hook (`useIsMobile.ts`) lives at the top-level `src/hooks/`.

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

| Category | Examples                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalog  | `useProducts`, `useProduct`, `useCategories`, `useStore`                                                                                               |
| Account  | `useOrders`, `useAddresses`, `useFavorites`, `useProfile`, `useNotifications`, `useOrderTracking`                                                      |
| Auth     | `useAuth` (context wrapper)                                                                                                                            |
| Checkout | `useCheckout`, `useCheckoutTotals`, `usePayment`, `usePaymentMethods`, `useShippingOptions`, `useActivePlatformPromotions`, `useActiveStorePromotions` |
| Search   | `useSearchContext`, `useRecentSearches`, `useNavbarSearchCombobox`, `useSearchSuggestions`, `useSearchRecoverySuggestions`                             |
| Reviews  | `useReviews`, `useCustomerReviews`, `useOrderPendingReviews`, `useOrdersReviewStatus`                                                                  |

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

### `useOrderTracking`

Public order-tracking query (`OrderTrackingDocument`, `fetchPolicy: 'network-only'`). Returns a discriminated `queryState` (`loading` / `success` / `not-found` / `error`) so the page can render distinct not-found vs. network-error copy. Used by `/track/[orderNumber]` and, via `OrderShipmentTrackingList`, the authenticated order detail page.

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
