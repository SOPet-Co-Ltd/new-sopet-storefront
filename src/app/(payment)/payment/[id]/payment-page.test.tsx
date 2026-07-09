import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentPage from '@/app/(payment)/payment/[id]/page';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  CHECKOUT_ORDER_ID,
  CHECKOUT_PAYMENT_ID,
  samplePaidPayment,
  samplePendingPayment,
} from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useParams: () => ({ id: CHECKOUT_PAYMENT_ID }),
  usePathname: () => `/payment/${CHECKOUT_PAYMENT_ID}`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/organisms/OrderPaymentForm/constants', () => ({
  PAYMENT_POLL_INTERVAL_MS: 50,
  PAYMENT_POLL_MAX_ATTEMPTS: 30,
}));

const createWrapper = createApolloTestWrapper;

describe('PaymentPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('poll detects paid status and navigates to confirmation route', async () => {
    let pollCount = 0;

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

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(`/order/${CHECKOUT_ORDER_ID}/confirmed`);
      },
      { timeout: 5_000 },
    );

    expect(pollCount).toBeGreaterThanOrEqual(2);
  });

  it('falls back to paymentByOrderId when payment id lookup is not found', async () => {
    server.use(
      graphql.query('Payment', () => {
        return HttpResponse.json({
          errors: [
            {
              message: 'Payment not found',
              extensions: { code: 'PAYMENT_NOT_FOUND' },
            },
          ],
        });
      }),
      graphql.query('PaymentByOrderId', ({ variables }) => {
        expect(variables).toMatchObject({ orderId: CHECKOUT_PAYMENT_ID });
        return HttpResponse.json({
          data: { paymentByOrderId: samplePendingPayment },
        });
      }),
    );

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    });
  });
});
