import type { ReactNode } from 'react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import {
  CATALOG_PRODUCT_ID,
  sampleCategories,
  sampleProductCard,
  sampleProductDetail,
  sampleStore,
} from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

// Mock boundary: Vitest jsdom cannot load registerApolloClient from apollo-rsc;
// substitute makeApolloClient() so real Apollo transport still hits MSW at the GraphQL boundary.
vi.mock('@/lib/graphql/apollo-rsc', async () => {
  const { makeApolloClient } = await import('@/lib/graphql/client');
  const client = makeApolloClient();

  return {
    getClient: () => client,
    query: client.query.bind(client),
    PreloadQuery: ({ children }: { children: ReactNode }) => children,
  };
});

import {
  fetchAllSitemapProducts,
  fetchApprovedCategories,
  fetchApprovedStores,
  fetchProductById,
  fetchStoreBySlug,
} from './fetch';

describe('fetchProductById', () => {
  // AC: Published product ID returns full product detail from GraphQL
  // Behavior: MSW ProductById fixture → fetchProductById → product fields match sampleProductDetail
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW ProductById fixture, apollo-rsc mock (makeApolloClient)
  // ROI: 88 (BV:9 × Freq:8 + Legal:0 + Defect:8)
  it('returns product detail for a published product id', async () => {
    const product = await fetchProductById(CATALOG_PRODUCT_ID);

    expect(product).toEqual(sampleProductDetail);
  });

  // AC: Missing product returns null without throw (unavailable boundary)
  // Behavior: MSW returns product:null → fetchProductById → null
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW ProductById error override
  // ROI: 85 (BV:8 × Freq:9 + Legal:0 + Defect:8)
  it('returns null when product is not found', async () => {
    server.use(
      graphql.query('ProductById', () => {
        return HttpResponse.json({
          data: { product: null },
        });
      }),
    );

    const product = await fetchProductById('missing-product');

    expect(product).toBeNull();
  });

  // AC: GraphQL failure returns null without throw (unavailable boundary)
  // Behavior: MSW returns 500 + errors → fetchProductById → null
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW ProductById error override
  // ROI: 87 (BV:9 × Freq:8 + Legal:0 + Defect:8)
  it('returns null when GraphQL request fails', async () => {
    server.use(
      graphql.query('ProductById', ({ variables }) => {
        if (variables.id === 'gql-error-product') {
          return HttpResponse.json(
            {
              errors: [{ message: 'Product lookup failed' }],
            },
            { status: 500 },
          );
        }

        return HttpResponse.json({
          data: { product: sampleProductDetail },
        });
      }),
    );

    const product = await fetchProductById('gql-error-product');

    expect(product).toBeNull();
  });

  // AC: cache() deduplicates GraphQL within render pass (shared-state dependency)
  // Behavior: parallel fetchProductById(same id) → single MSW call count
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW ProductById call-count assertion, React cache()
  // ROI: 90 (BV:9 × Freq:9 + Legal:0 + Defect:9)
  it('deduplicates GraphQL calls for the same product id', async () => {
    let callCount = 0;

    server.use(
      graphql.query('ProductById', ({ variables }) => {
        if (variables.id !== 'dedup-product-id') {
          return HttpResponse.json({
            data: { product: sampleProductDetail },
          });
        }

        callCount += 1;
        return HttpResponse.json({
          data: { product: sampleProductDetail },
        });
      }),
    );

    await Promise.all([fetchProductById('dedup-product-id'), fetchProductById('dedup-product-id')]);

    expect(callCount).toBe(1);
  });
});

describe('fetchApprovedCategories', () => {
  // AC: Approved categories loader returns MSW fixture list
  // Behavior: MSW ApprovedCategories → fetchApprovedCategories → sampleCategories
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW ApprovedCategories fixture
  // ROI: 75 (BV:7 × Freq:9 + Legal:0 + Defect:7)
  it('returns approved categories from GraphQL', async () => {
    const categories = await fetchApprovedCategories();

    expect(categories).toEqual(sampleCategories);
  });
});

describe('fetchStoreBySlug', () => {
  // AC: Valid store slug returns store fields including approved status
  // Behavior: MSW StoreBySlug fixture → fetchStoreBySlug → sampleStore with status approved
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW StoreBySlug fixture
  // ROI: 78 (BV:8 × Freq:8 + Legal:0 + Defect:7)
  it('returns store fields including status for a valid slug', async () => {
    const store = await fetchStoreBySlug(sampleStore.slug);

    expect(store).toEqual(sampleStore);
    expect(store?.status).toBe('approved');
  });

  // AC: Missing store slug returns null without throw
  // Behavior: MSW returns storeBySlug:null → fetchStoreBySlug → null
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW StoreBySlug error override
  // ROI: 76 (BV:7 × Freq:9 + Legal:0 + Defect:7)
  it('returns null when store is not found', async () => {
    server.use(
      graphql.query('StoreBySlug', () => {
        return HttpResponse.json({
          data: { storeBySlug: null },
        });
      }),
    );

    const store = await fetchStoreBySlug('missing-store');

    expect(store).toBeNull();
  });
});

describe('fetchAllSitemapProducts', () => {
  // AC: Sitemap product loader paginates at limit 250 until all pages fetched
  // Behavior: MSW Products two-page response → fetchAllSitemapProducts → limit 250 per request, merged items
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW Products pagination override
  // ROI: 82 (BV:8 × Freq:8 + Legal:0 + Defect:8)
  it('paginates products with limit 250 per request', async () => {
    const capturedLimits: number[] = [];

    server.use(
      graphql.query('Products', ({ variables }) => {
        const page = (variables.page as number | undefined) ?? 1;
        capturedLimits.push((variables.limit as number | undefined) ?? 0);

        if (page === 1) {
          return HttpResponse.json({
            data: {
              products: {
                items: [sampleProductCard],
                pagination: {
                  page: 1,
                  limit: 250,
                  total: 2,
                  totalPages: 2,
                },
              },
            },
          });
        }

        return HttpResponse.json({
          data: {
            products: {
              items: [{ ...sampleProductCard, id: 'prod-002' }],
              pagination: {
                page: 2,
                limit: 250,
                total: 2,
                totalPages: 2,
              },
            },
          },
        });
      }),
    );

    const products = await fetchAllSitemapProducts();

    expect(capturedLimits).toEqual([250, 250]);
    expect(products).toHaveLength(2);
  });
});

describe('fetchApprovedStores', () => {
  // AC: Approved stores loader filters out non-approved stores
  // Behavior: MSW Stores mixed statuses → fetchApprovedStores → only approved store returned
  // @category: core-functionality
  // @lane: unit
  // @dependency: MSW Stores override with pending store
  // ROI: 80 (BV:8 × Freq:8 + Legal:0 + Defect:7)
  it('returns only approved stores from GraphQL', async () => {
    server.use(
      graphql.query('Stores', () => {
        return HttpResponse.json({
          data: {
            stores: [
              sampleStore,
              {
                ...sampleStore,
                id: 'store-pending',
                slug: 'pending-store',
                status: 'pending',
              },
            ],
          },
        });
      }),
    );

    const stores = await fetchApprovedStores();

    expect(stores).toHaveLength(1);
    expect(stores?.[0]?.status).toBe('approved');
  });
});
