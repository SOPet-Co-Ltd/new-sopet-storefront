import { ApolloProvider } from '@apollo/client/react';
import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { getApolloClient } from '@/lib/graphql/client';
import { useProducts } from '@/lib/hooks/useProducts';
import { server } from '@/test/mocks/server';
import {
  CATALOG_STORE_ID,
  defaultProductsPagination,
  sampleProductCard,
} from '@/test/mocks/fixtures/catalog';

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ApolloProvider, { client }, children);
  };
}

afterEach(async () => {
  await getApolloClient().clearStore();
});

describe('useProducts', () => {
  // AC: Phase 1 catalog — products list with category filter and pagination
  // Behavior: Hook called with category → GraphQL Products query → returns paginated items
  // @category: integration
  // @lane: integration
  // @dependency: MSW
  // @complexity: medium
  // ROI: 72
  it('returns paginated products for category filter', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ category: 'dog-food', page: 1, limit: 24 });
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: defaultProductsPagination,
            },
          },
        });
      }),
    );

    const { result } = renderHook(() => useProducts({ category: 'dog-food' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products[0]?.name).toBe('Premium Dog Food 5kg');
    });
    expect(result.current.total).toBe(1);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(24);
  });

  // AC: Phase 1 search — products(search:) returns matching items
  // Behavior: Hook called with search term → GraphQL Products query → returns search results
  // @category: integration
  // @lane: integration
  // @dependency: MSW
  // @complexity: medium
  // ROI: 72
  it('returns paginated products for search query', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ search: 'dog food', page: 1 });
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: defaultProductsPagination,
            },
          },
        });
      }),
    );

    const { result } = renderHook(() => useProducts({ search: 'dog food' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products[0]?.slug).toBe('premium-dog-food-5kg');
    });
    expect(result.current.total).toBe(1);
  });

  // AC: Phase 1 catalog — products filtered by storeId
  // Behavior: Hook called with storeId → GraphQL Products query → returns store-scoped items
  // @category: integration
  // @lane: integration
  // @dependency: MSW
  // @complexity: low
  // ROI: 48
  it('passes storeId variable to products query', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ storeId: CATALOG_STORE_ID, page: 1 });
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: { page: 2, limit: 24, total: 48, totalPages: 2 },
            },
          },
        });
      }),
    );

    const { result } = renderHook(
      () => useProducts({ storeId: CATALOG_STORE_ID, page: 1 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
    });
    expect(result.current.totalPages).toBe(2);
    expect(result.current.page).toBe(2);
  });
});
