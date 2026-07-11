import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { useOrderTracking } from '@/lib/hooks/useOrderTracking';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  ORDER_TRACKING_SEED_NUMBER,
  sampleOrderTracking,
} from '@/test/mocks/fixtures/order-tracking';
import { server } from '@/test/mocks/server';

const createWrapper = createApolloTestWrapper;

describe('useOrderTracking', () => {
  it('returns not-found for empty or whitespace orderNumber without GraphQL requests', async () => {
    const orderTrackingHandler = vi.fn();

    server.use(
      graphql.query('OrderTracking', () => {
        orderTrackingHandler();
        return HttpResponse.json({
          data: { orderTracking: sampleOrderTracking },
        });
      }),
    );

    const { result } = renderHook(() => useOrderTracking('   '), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.queryState.status).toBe('not-found');
    });

    expect(orderTrackingHandler).not.toHaveBeenCalled();
    expect(result.current.orderNumber).toBe('');
  });

  it('returns not-found for ORDER_NOT_FOUND GraphQL error', async () => {
    server.use(
      graphql.query('OrderTracking', () => {
        return HttpResponse.json({
          errors: [
            {
              message: 'Order not found',
              extensions: { code: 'ORDER_NOT_FOUND' },
            },
          ],
        });
      }),
    );

    const { result } = renderHook(() => useOrderTracking('ORD-MISSING-001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.queryState.status).toBe('not-found');
    });
  });

  it('returns error for network failures', async () => {
    server.use(
      graphql.query('OrderTracking', () => {
        return HttpResponse.error();
      }),
    );

    const { result } = renderHook(() => useOrderTracking('ORD-NETWORK-001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.queryState.status).toBe('error');
    });

    if (result.current.queryState.status === 'error') {
      expect(result.current.queryState.error).toBeInstanceOf(Error);
    }
  });

  it('returns success with order tracking data', async () => {
    server.use(
      graphql.query('OrderTracking', ({ variables }) => {
        expect(variables).toMatchObject({ orderNumber: ORDER_TRACKING_SEED_NUMBER });
        return HttpResponse.json({
          data: {
            orderTracking: {
              ...sampleOrderTracking,
              orderNumber: ORDER_TRACKING_SEED_NUMBER,
            },
          },
        });
      }),
    );

    const { result } = renderHook(() => useOrderTracking(ORDER_TRACKING_SEED_NUMBER), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.queryState.status).toBe('success');
    });

    if (result.current.queryState.status === 'success') {
      expect(result.current.queryState.data.orderNumber).toBe(ORDER_TRACKING_SEED_NUMBER);
    }
  });
});
