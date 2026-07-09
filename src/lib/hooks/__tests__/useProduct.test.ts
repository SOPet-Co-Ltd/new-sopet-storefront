import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useProduct } from '@/lib/hooks/useProduct';
import { server } from '@/test/mocks/server';
import {
  CATALOG_PRODUCT_ID,
  CATALOG_STORE_ID,
  sampleProductDetail,
} from '@/test/mocks/fixtures/catalog';

const createWrapper = createApolloTestWrapper;

describe('useProduct', () => {
  // AC: P0-T9 slug strategy — productBySlug requires slug + storeId
  // Behavior: Hook slug mode with both params → GraphQL ProductBySlug → returns product detail
  // @category: integration
  // @lane: integration
  // @dependency: MSW
  // @complexity: medium
  // ROI: 80
  it('resolves product by slug and storeId', async () => {
    server.use(
      graphql.query('ProductBySlug', ({ variables }) => {
        expect(variables).toEqual({ slug: 'premium-dog-food-5kg', storeId: CATALOG_STORE_ID });
        return HttpResponse.json({ data: { productBySlug: sampleProductDetail } });
      }),
    );

    const { result } = renderHook(
      () =>
        useProduct({
          mode: 'slug',
          slug: 'premium-dog-food-5kg',
          storeId: CATALOG_STORE_ID,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.product?.name).toBe('Premium Dog Food 5kg');
    });
    expect(result.current.missingStoreId).toBe(false);
  });

  // AC: Phase 1 PDP — product resolved by UUID
  // Behavior: Hook id mode → GraphQL ProductById → returns product detail
  // @category: integration
  // @lane: integration
  // @dependency: MSW
  // @complexity: medium
  // ROI: 64
  it('resolves product by id', async () => {
    server.use(
      graphql.query('ProductById', ({ variables }) => {
        expect(variables).toEqual({ id: CATALOG_PRODUCT_ID });
        return HttpResponse.json({ data: { product: sampleProductDetail } });
      }),
    );

    const { result } = renderHook(
      () => useProduct({ mode: 'id', id: CATALOG_PRODUCT_ID }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.product?.id).toBe(CATALOG_PRODUCT_ID);
    });
    expect(result.current.missingStoreId).toBe(false);
  });

  // AC: P0-T9 slug strategy — slug-only lookup skipped until backend supports it
  // Behavior: Hook slug mode without storeId → no query → missingStoreId true
  // @category: edge-case
  // @lane: integration
  // @dependency: none
  // @complexity: low
  // ROI: 56
  it('surfaces missingStoreId when slug-only without storeId', async () => {
    const { result } = renderHook(
      () => useProduct({ mode: 'slug', slug: 'premium-dog-food-5kg' }),
      { wrapper: createWrapper() },
    );

    expect(result.current.missingStoreId).toBe(true);
    expect(result.current.product).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
