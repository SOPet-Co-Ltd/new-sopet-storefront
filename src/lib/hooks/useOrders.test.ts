import { act, renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrderDetail } from './useOrders';
import { sampleOrder } from '@/test/mocks/fixtures/checkout';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

const shippedOrder = {
  ...sampleOrder,
  id: 'order-shipped-1',
  status: 'shipped',
};

const deliveredOrder = {
  ...shippedOrder,
  status: 'delivered',
  items: shippedOrder.items.map((item) => ({
    ...item,
    fulfillmentStatus: 'delivered',
  })),
};

describe('useOrderDetail confirmOrderDelivered', () => {
  beforeEach(() => {
    server.use(
      graphql.query('Order', ({ variables }) => {
        if (!variables?.id) {
          return HttpResponse.json({
            errors: [{ message: 'Variable "$id" of required type "String!" was not provided.' }],
          });
        }
        return HttpResponse.json({
          data: {
            order: variables.id === deliveredOrder.id ? deliveredOrder : shippedOrder,
          },
        });
      }),
      graphql.query('Orders', () => {
        return HttpResponse.json({
          data: {
            orders: {
              items: [shippedOrder],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          },
        });
      }),
      graphql.mutation('ConfirmOrderDelivered', () => {
        return HttpResponse.json({
          data: { confirmOrderDelivered: deliveredOrder },
        });
      }),
    );
  });

  it('refetches Order with the confirmed order id (not empty variables)', async () => {
    const orderQueryVariables: Array<Record<string, unknown> | undefined> = [];

    server.use(
      graphql.query('Order', ({ variables }) => {
        orderQueryVariables.push(variables as Record<string, unknown> | undefined);
        if (!variables?.id) {
          return HttpResponse.json({
            errors: [{ message: 'Variable "$id" of required type "String!" was not provided.' }],
          });
        }
        return HttpResponse.json({
          data: {
            order: variables.id === deliveredOrder.id ? deliveredOrder : shippedOrder,
          },
        });
      }),
    );

    const { result } = renderHook(() => useOrderDetail(shippedOrder.id), {
      wrapper: createApolloTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.order?.id).toBe(shippedOrder.id);
    });

    await act(async () => {
      await result.current.confirmOrderDelivered(shippedOrder.id);
    });

    const refetchVariables = orderQueryVariables.slice(1);
    expect(refetchVariables.length).toBeGreaterThan(0);
    expect(refetchVariables.every((vars) => vars?.id === shippedOrder.id)).toBe(true);
    expect(refetchVariables.some((vars) => !vars?.id)).toBe(false);
  });
});
