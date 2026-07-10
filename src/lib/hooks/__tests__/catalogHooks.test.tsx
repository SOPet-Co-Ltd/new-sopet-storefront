import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useCategories } from '@/lib/hooks/useCategories';
import { useReviews } from '@/lib/hooks/useReviews';
import { useStore } from '@/lib/hooks/useStore';
import { server } from '@/test/mocks/server';
import {
  CATALOG_PRODUCT_ID,
  CATALOG_STORE_ID,
  sampleCategories,
  sampleProductReview,
  sampleStore,
  sampleStoreReviewSummary,
} from '@/test/mocks/fixtures/catalog';

const createWrapper = createApolloTestWrapper;

describe('useCategories', () => {
  it('returns approvedCategories', async () => {
    server.use(
      graphql.query('ApprovedCategories', () => {
        return HttpResponse.json({ data: { approvedCategories: sampleCategories } });
      }),
    );

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[0]?.slug).toBe('dog-food');
  });
});

describe('useStore', () => {
  it('resolves storeBySlug', async () => {
    server.use(
      graphql.query('StoreBySlug', ({ variables }) => {
        expect(variables).toEqual({ slug: 'sopet-pet-shop' });
        return HttpResponse.json({ data: { storeBySlug: sampleStore } });
      }),
    );

    const { result } = renderHook(
      () => useStore({ slug: 'sopet-pet-shop' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.store?.name).toBe('SOPet Pet Shop');
    });
    expect(result.current.store?.slug).toBe('sopet-pet-shop');
  });
});

describe('useReviews', () => {
  it('fetches productReviews and storeReviewSummary', async () => {
    server.use(
      graphql.query('ProductReviews', ({ variables }) => {
        expect(variables).toEqual({ productId: CATALOG_PRODUCT_ID });
        return HttpResponse.json({ data: { productReviews: [sampleProductReview] } });
      }),
      graphql.query('StoreReviewSummary', ({ variables }) => {
        expect(variables).toEqual({ storeId: CATALOG_STORE_ID });
        return HttpResponse.json({ data: { storeReviewSummary: sampleStoreReviewSummary } });
      }),
      graphql.query('StoreReviews', ({ variables }) => {
        expect(variables).toEqual({ storeId: CATALOG_STORE_ID });
        return HttpResponse.json({ data: { storeReviews: [] } });
      }),
    );

    const { result } = renderHook(
      () => useReviews({ productId: CATALOG_PRODUCT_ID, storeId: CATALOG_STORE_ID }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.productReviews).toHaveLength(1);
    expect(result.current.productReviews[0]?.rating).toBe(5);
    expect(result.current.storeReviewSummary?.averageRating).toBe(4.6);
    expect(result.current.storeReviewSummary?.totalCount).toBe(24);
  });
});
