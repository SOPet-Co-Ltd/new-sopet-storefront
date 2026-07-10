import type { DocumentNode } from '@apollo/client';
import {
  AddressesDocument,
  CustomerReviewableItemsDocument,
  FavoritesDocument,
  MyDisputesDocument,
  MyReviewsDocument,
  NotificationsDocument,
  OrderDocument,
  OrdersDocument,
  PaymentMethodsDocument,
} from '@/lib/graphql/generated/graphql';
import { ORDERS_PAGE_SIZE } from '@/lib/constants/orderListFilters';
import { getApolloClient } from '@/lib/graphql/client';
import {
  MY_REVIEWS_DEFAULT_LIMIT,
  MY_REVIEWS_DEFAULT_OFFSET,
} from '@/lib/hooks/useCustomerReviews';

type AccountPrefetchSpec = {
  query: DocumentNode;
  variables?: Record<string, unknown>;
};

const ACCOUNT_PREFETCH_SPECS: Record<string, AccountPrefetchSpec[] | null> = {
  '/user/profile': null,
  '/user/orders': [
    {
      query: OrdersDocument,
      variables: { page: 1, limit: ORDERS_PAGE_SIZE, filter: 'ALL' },
    },
  ],
  '/user/addresses': [{ query: AddressesDocument }],
  '/user/favorites': [{ query: FavoritesDocument }],
  '/user/reviews': [
    { query: CustomerReviewableItemsDocument },
    {
      query: MyReviewsDocument,
      variables: {
        limit: MY_REVIEWS_DEFAULT_LIMIT,
        offset: MY_REVIEWS_DEFAULT_OFFSET,
      },
    },
  ],
  '/user/notifications': [{ query: NotificationsDocument, variables: { unreadOnly: false } }],
  '/user/credit': [{ query: PaymentMethodsDocument }],
  '/user/returns': [{ query: MyDisputesDocument }],
  '/user/delete': null,
};

const prefetchedKeys = new Set<string>();
const inflightPrefetches = new Map<string, Promise<unknown>>();

function buildPrefetchKey(key: string, variables?: Record<string, unknown>): string {
  return variables ? `${key}:${JSON.stringify(variables)}` : key;
}

function prefetchAccountQuery(
  key: string,
  query: DocumentNode,
  variables?: Record<string, unknown>,
): void {
  const cacheKey = buildPrefetchKey(key, variables);
  if (prefetchedKeys.has(cacheKey) || inflightPrefetches.has(cacheKey)) {
    return;
  }

  const promise = getApolloClient()
    .query({
      query,
      variables,
      fetchPolicy: 'cache-first',
    })
    .then(() => {
      prefetchedKeys.add(cacheKey);
    })
    .finally(() => {
      inflightPrefetches.delete(cacheKey);
    });

  inflightPrefetches.set(cacheKey, promise);
}

export function prefetchAccountPage(href: string): void {
  const specs = ACCOUNT_PREFETCH_SPECS[href];
  if (!specs) {
    return;
  }

  specs.forEach((spec, index) => {
    prefetchAccountQuery(`${href}:${index}`, spec.query, spec.variables);
  });
}

export function prefetchOrderDetail(orderId: string): void {
  prefetchAccountQuery(`order:${orderId}`, OrderDocument, { id: orderId });
}

export function prefetchAllAccountPages(): void {
  Object.keys(ACCOUNT_PREFETCH_SPECS).forEach((href) => {
    prefetchAccountPage(href);
  });
}

export function createAccountPagePrefetchHandlers(
  href: string,
  prefetchRoute?: () => void,
): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  const prefetch = () => {
    prefetchRoute?.();
    prefetchAccountPage(href);
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

export function __resetAccountPrefetchStateForTests(): void {
  prefetchedKeys.clear();
  inflightPrefetches.clear();
}
