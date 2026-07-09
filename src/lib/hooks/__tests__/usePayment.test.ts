import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { usePayment } from '@/lib/hooks/usePayment';
import { server } from '@/test/mocks/server';
import {
  CHECKOUT_ORDER_ID,
  CHECKOUT_PAYMENT_ID,
  samplePaidPayment,
  samplePendingPayment,
} from '@/test/mocks/fixtures/checkout';

const createWrapper = createApolloTestWrapper;

describe('usePayment', () => {
  it('loads payment by id', async () => {
    server.use(
      graphql.query('Payment', ({ variables }) => {
        expect(variables).toMatchObject({ id: CHECKOUT_PAYMENT_ID });
        return HttpResponse.json({
          data: { payment: samplePendingPayment },
        });
      }),
    );

    const { result } = renderHook(
      () => usePayment({ id: CHECKOUT_PAYMENT_ID }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.payment?.status).toBe('pending');
    });
  });

  it('poll returns pending then paid and stops', async () => {
    let pollCount = 0;
    const statusTrail: string[] = [];

    server.use(
      graphql.query('Payment', () => {
        pollCount += 1;
        return HttpResponse.json({
          data: {
            payment: pollCount >= 2 ? samplePaidPayment : samplePendingPayment,
          },
        });
      }),
    );

    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const pollResult = await result.current.poll({
      id: CHECKOUT_PAYMENT_ID,
      intervalMs: 10,
      maxAttempts: 5,
      onStatus: (status) => {
        statusTrail.push(status);
      },
    });

    expect(pollResult.status).toBe('paid');
    expect(pollResult.payment.id).toBe(CHECKOUT_PAYMENT_ID);
    expect(pollCount).toBeGreaterThanOrEqual(2);
    expect(statusTrail).toContain('pending');
    expect(statusTrail.at(-1)).toBe('paid');
  });

  it('poll resolves payment by order id', async () => {
    server.use(
      graphql.query('PaymentByOrderId', ({ variables }) => {
        expect(variables).toMatchObject({ orderId: CHECKOUT_ORDER_ID });
        return HttpResponse.json({
          data: { paymentByOrderId: samplePaidPayment },
        });
      }),
    );

    const { result } = renderHook(() => usePayment(), {
      wrapper: createWrapper(),
    });

    const pollResult = await result.current.poll({
      orderId: CHECKOUT_ORDER_ID,
      intervalMs: 10,
      maxAttempts: 3,
    });

    expect(pollResult.status).toBe('paid');
    expect(pollResult.payment.orderId).toBe(CHECKOUT_ORDER_ID);
  });
});
