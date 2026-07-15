import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentPage from '@/app/(payment)/payment/[id]/page';
import {
  resetPayment3dsAutoRedirectMemory,
  threeDSAutoRedirectStorageKey,
} from '@/components/organisms/OrderPaymentForm/Payment3dsAutoRedirect';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  CHECKOUT_ORDER_ID,
  CHECKOUT_PAYMENT_ID,
  CHECKOUT_RETRY_PAYMENT_ID,
  samplePaidPayment,
  samplePendingPayment,
  sampleRetryPendingPayment,
} from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockCreatePayment = vi.fn();
const AUTHORIZE_URI = 'https://pay.omise.co/offsites/ofsp_test/pay';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useParams: () => ({ id: CHECKOUT_PAYMENT_ID }),
  usePathname: () => `/payment/${CHECKOUT_PAYMENT_ID}`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/usePaymentMethods', () => ({
  usePaymentMethods: vi.fn(() => ({
    paymentMethods: [],
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    addPaymentMethod: vi.fn(),
    deletePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/useCheckout', () => ({
  useCheckout: () => ({
    validatePromotion: vi.fn(),
    createOrder: vi.fn(),
    createPayment: mockCreatePayment,
    validatingPromotion: false,
    creatingOrder: false,
    creatingPayment: false,
    loading: false,
    error: undefined,
  }),
}));

const samplePendingCardPayment = {
  ...samplePendingPayment,
  qrCodeUrl: null,
  authorizeUri: AUTHORIZE_URI,
  paymentMethod: 'credit_card',
  expiresAt: null,
};

const sampleFailedCardPayment = {
  ...samplePendingCardPayment,
  status: 'failed' as const,
  authorizeUri: null,
};

const paymentState = {
  payment: samplePendingPayment as
    | typeof samplePendingPayment
    | typeof samplePaidPayment
    | typeof samplePendingCardPayment
    | typeof sampleFailedCardPayment
    | typeof sampleRetryPendingPayment,
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

async function submitPromptPayRetry(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i }));
  await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));
}

describe('PaymentPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    mockCreatePayment.mockReset();
    mockCreatePayment.mockResolvedValue(sampleRetryPendingPayment);
    paymentState.payment = samplePendingPayment;
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
  });

  afterEach(() => {
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
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
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('return alone with pending status shows waiting, not thank-you (BC-5 / AC-007)', async () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID), AUTHORIZE_URI);
    paymentState.payment = samplePendingCardPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-waiting-after-return')).toBeInTheDocument();
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByText('ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...')).not.toBeInTheDocument();
    expect(screen.getByText('กำลังยืนยันการชำระเงิน...')).toBeInTheDocument();
  });

  it('paid handoff navigates thank-you once even after prior pending paint', async () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID), AUTHORIZE_URI);
    paymentState.payment = samplePendingCardPayment;

    const { rerender } = render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-waiting-after-return')).toBeInTheDocument();
    });

    paymentState.payment = {
      ...samplePendingCardPayment,
      status: 'paid',
    };
    rerender(<PaymentPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/thank-you/${CHECKOUT_ORDER_ID}`);
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
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

  it('pending-after-return retry navigates to new paymentId (AC-009 / SameOrderCreatePayment)', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID), AUTHORIZE_URI);
    paymentState.payment = samplePendingCardPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-waiting-after-return')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));
    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalledWith({
        orderId: CHECKOUT_ORDER_ID,
        amount: samplePendingCardPayment.amount,
        currency: 'THB',
        paymentMethod: 'promptpay',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
    });
    expect(mockPush).not.toHaveBeenCalledWith(`/payment/${CHECKOUT_PAYMENT_ID}`);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID))).toBeNull();
  });

  it('failed path retry navigates to new paymentId (AC-009)', async () => {
    const user = userEvent.setup();
    paymentState.payment = sampleFailedCardPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    });

    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
    });
    expect(mockPush).not.toHaveBeenCalledWith(`/payment/${CHECKOUT_PAYMENT_ID}`);
  });

  it('mutation error stays on panel without navigation', async () => {
    const user = userEvent.setup();
    mockCreatePayment.mockRejectedValue(new Error('create payment failed'));
    paymentState.payment = sampleFailedCardPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    });

    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(screen.getByText('create payment failed')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
  });

  it('same payment id response does not soft-succeed navigate (BC-1)', async () => {
    const user = userEvent.setup();
    mockCreatePayment.mockResolvedValue({
      ...samplePendingCardPayment,
      id: CHECKOUT_PAYMENT_ID,
    });
    paymentState.payment = sampleFailedCardPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    });

    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(
        screen.getByText('ไม่สามารถสร้างการชำระเงินใหม่ได้ กรุณาลองใหม่อีกครั้ง'),
      ).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
