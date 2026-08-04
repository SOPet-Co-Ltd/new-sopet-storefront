# Hooks

Data hooks live in `src/lib/hooks/` (30 modules). A separate, non-GraphQL hook (`useIsMobile.ts`) lives at the top-level `src/hooks/`.

## Pattern

```typescript
'use client';

import { useQuery } from '@apollo/client/react';
import { ProductsDocument, type ProductsQuery } from '@/lib/graphql/generated/graphql';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';

export interface UseProductsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useProducts(params: UseProductsParams) {
  const variables = buildProductsListingVariables(params);
  const { data, loading, error, fetchMore } = useQuery(ProductsDocument, {
    variables,
  });
  // map and return typed result
}
```

## Conventions

| Rule      | Detail                                                       |
| --------- | ------------------------------------------------------------ |
| Location  | `src/lib/hooks/use*.ts`                                      |
| Directive | `'use client'` at top                                        |
| Imports   | `*Document` from `generated/graphql`                         |
| Types     | Derive from query/mutation types                             |
| Errors    | Many hooks map Apollo errors with a local `toHookError()`    |
| Tests     | Co-located `*.test.ts` / `*.test.tsx`, or under `__tests__/` |

## Hook categories

| Category | Hooks                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalog  | `useProducts`, `useProduct`, `useCategories`, `useStore`                                                                                               |
| Account  | `useOrders`, `useAddresses`, `useFavorites`, `useProfile`, `useNotifications`                                                                          |
| Tracking | `useOrderTracking` (public capability URL + shared shipment list)                                                                                      |
| Auth     | `useAuth` (context wrapper)                                                                                                                            |
| Checkout | `useCheckout`, `useCheckoutTotals`, `usePayment`, `usePaymentMethods`, `useShippingOptions`, `useActivePlatformPromotions`, `useActiveStorePromotions` |
| Search   | `useSearchContext`, `useRecentSearches`, `useNavbarSearchCombobox`, `useSearchSuggestions`, `useSearchRecoverySuggestions`                             |
| Reviews  | `useReviews`, `useCustomerReviews`, `useOrderPendingReviews`, `useOrdersReviewStatus`                                                                  |
| Utility  | `useDebouncedValue`, `useSessionId`, `usePaymentCountdown`                                                                                             |

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

### Notifications

`useNotifications`, `useMarkNotificationRead`, and `useMarkAllNotificationsRead` live in `useNotifications.ts`. Unread badge UI (`UnreadBadge`) queries `UnreadCountDocument` (`unreadNotificationsCount`) directly.

## Testing hooks

Prefer MSW + `createApolloTestWrapper()`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useProducts } from '@/lib/hooks/useProducts';

const { result } = renderHook(() => useProducts({ category: 'dog' }), {
  wrapper: createApolloTestWrapper(),
});

await waitFor(() => expect(result.current.loading).toBe(false));
```

Override GraphQL responses with `server.use(...)` against handlers in `src/test/mocks/handlers.ts`. `MockedProvider` still appears in a few provider unit tests (for example `AuthProvider.test.tsx`).

## Related docs

- [GraphQL](graphql.md)
- [State management](state-management.md)
