import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { useOrderPendingReviews } from './useOrderPendingReviews';
import { sampleReviewableItem } from '@/test/mocks/fixtures/account';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

const createWrapper = createApolloTestWrapper;

describe('useOrderPendingReviews', () => {
  it('returns pending review items for the requested order', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: {
            customerReviewableItems: [
              sampleReviewableItem,
              { ...sampleReviewableItem, orderId: 'order-2', orderItemId: 'item-2' },
            ],
          },
        });
      }),
    );

    const { result } = renderHook(() => useOrderPendingReviews('order-1', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPendingReviews).toBe(true);
    expect(result.current.pendingReviewItems).toHaveLength(1);
    expect(result.current.pendingReviewItems[0]?.orderId).toBe('order-1');
  });

  it('returns no pending reviews when all items from the order are reviewed', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [] },
        });
      }),
    );

    const { result } = renderHook(() => useOrderPendingReviews('order-1', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPendingReviews).toBe(false);
    expect(result.current.pendingReviewItems).toEqual([]);
  });
});
