import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { useOrdersReviewStatus } from './useOrdersReviewStatus';
import type { OrderSummary } from '@/lib/hooks/useOrders';
import { sampleReviewableItem } from '@/test/mocks/fixtures/account';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

const createWrapper = createApolloTestWrapper;

function createOrder(id: string, status: string): OrderSummary {
  return {
    id,
    orderNumber: `ORD-${id}`,
    status,
    createdAt: '2025-01-01T00:00:00.000Z',
    subtotal: 900,
    shippingFee: 50,
    discountAmount: 0,
    total: 950,
    paymentMethod: 'credit_card',
    items: [],
    storeShippings: [],
  } as OrderSummary;
}

describe('useOrdersReviewStatus', () => {
  it('marks delivered orders without pending reviews as fully reviewed', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [] },
        });
      }),
    );

    const orders = [createOrder('order-1', 'delivered'), createOrder('order-2', 'shipped')];
    const { result } = renderHook(() => useOrdersReviewStatus(orders), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isOrderFullyReviewed('order-1', 'delivered')).toBe(true);
    expect(result.current.isOrderFullyReviewed('order-2', 'shipped')).toBe(false);
  });

  it('does not mark delivered orders with pending reviews as fully reviewed', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: {
            customerReviewableItems: [{ ...sampleReviewableItem, orderId: 'order-1' }],
          },
        });
      }),
    );

    const orders = [createOrder('order-1', 'delivered')];
    const { result } = renderHook(() => useOrdersReviewStatus(orders), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isOrderFullyReviewed('order-1', 'delivered')).toBe(false);
  });
});
