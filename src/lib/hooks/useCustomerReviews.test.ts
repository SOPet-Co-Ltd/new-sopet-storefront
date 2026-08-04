import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import {
  MY_REVIEWS_DEFAULT_LIMIT,
  MY_REVIEWS_DEFAULT_OFFSET,
  useCustomerReviews,
} from '@/lib/hooks/useCustomerReviews';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleMyReview, sampleReviewableItem } from '@/test/mocks/fixtures/account';
import { server } from '@/test/mocks/server';

const createWrapper = createApolloTestWrapper;

describe('useCustomerReviews', () => {
  it('fetches customerReviewableItems when tab is pending', async () => {
    let reviewableItemsCallCount = 0;
    let myReviewsCallCount = 0;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        reviewableItemsCallCount += 1;
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.query('MyReviews', () => {
        myReviewsCallCount += 1;
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
    );

    const { result } = renderHook(() => useCustomerReviews({ tab: 'pending' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reviewableItems[0]?.orderNumber).toBe(sampleReviewableItem.orderNumber);
    expect(result.current.myReviews).toEqual([]);
    expect(reviewableItemsCallCount).toBe(1);
    expect(myReviewsCallCount).toBe(0);
  });

  it('fetches myReviews when tab is written', async () => {
    let reviewableItemsCallCount = 0;
    let myReviewsCallCount = 0;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        reviewableItemsCallCount += 1;
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.query('MyReviews', ({ variables }) => {
        myReviewsCallCount += 1;
        expect(variables).toEqual({
          limit: MY_REVIEWS_DEFAULT_LIMIT,
          offset: MY_REVIEWS_DEFAULT_OFFSET,
        });
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
    );

    const { result } = renderHook(() => useCustomerReviews({ tab: 'written' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.myReviews[0]?.id).toBe(sampleMyReview.id);
    expect(result.current.reviewableItems).toEqual([]);
    expect(reviewableItemsCallCount).toBe(0);
    expect(myReviewsCallCount).toBe(1);
  });

  it('skips inactive tab query when tab changes', async () => {
    let reviewableItemsCallCount = 0;
    let myReviewsCallCount = 0;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        reviewableItemsCallCount += 1;
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.query('MyReviews', () => {
        myReviewsCallCount += 1;
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
    );

    const { result, rerender } = renderHook(
      ({ tab }: { tab: 'pending' | 'written' }) => useCustomerReviews({ tab }),
      {
        wrapper: createWrapper(),
        initialProps: { tab: 'pending' as 'pending' | 'written' },
      },
    );

    await waitFor(() => {
      expect(result.current.reviewableItems).toHaveLength(1);
    });

    expect(reviewableItemsCallCount).toBe(1);
    expect(myReviewsCallCount).toBe(0);

    rerender({ tab: 'written' });

    await waitFor(() => {
      expect(result.current.myReviews).toHaveLength(1);
    });

    expect(reviewableItemsCallCount).toBe(1);
    expect(myReviewsCallCount).toBe(1);
  });

  it('surfaces GraphQL errors to the caller', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          errors: [{ message: 'Reviews unavailable' }],
        });
      }),
    );

    const { result } = renderHook(() => useCustomerReviews({ tab: 'pending' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.reviewableItems).toEqual([]);
  });

  it('exposes refetch for the active tab query', async () => {
    let reviewableItemsCallCount = 0;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        reviewableItemsCallCount += 1;
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    const { result } = renderHook(() => useCustomerReviews({ tab: 'pending' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(reviewableItemsCallCount).toBe(2);
    });
  });
});
