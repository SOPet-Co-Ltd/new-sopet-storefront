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

const paymentState = {
  payment: samplePendingPayment as typeof samplePendingPayment | typeof samplePaidPayment,
};

vi.mock('@/lib/hooks/usePayment', () => ({
  usePayment: () => ({
    payment: paymentState.payment,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    poll: vi.fn(),
  }),
}));

const createWrapper = createApolloTestWrapper;

describe('PaymentPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    paymentState.payment = samplePendingPayment;
  });

  it('redirects to thank-you when subscription reports paid status', async () => {
    server.use(
      graphql.query('Payment', () => {
        return HttpResponse.json({
          data: { payment: samplePendingPayment },
        });
      }),
    );

    const { rerender } = render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    });

    paymentState.payment = samplePaidPayment;
    rerender(<PaymentPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/thank-you/${CHECKOUT_ORDER_ID}`);
    });
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
