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

/** Controllable checkout loading flags — drives PaymentPage `retrySubmitting={creatingPayment}`. */
const checkoutState = {
  creatingPayment: false,
};

vi.mock('@/lib/hooks/useCheckout', () => ({
  useCheckout: () => ({
    validatePromotion: vi.fn(),
    createOrder: vi.fn(),
    createPayment: mockCreatePayment,
    validatingPromotion: false,
    creatingOrder: false,
    creatingPayment: checkoutState.creatingPayment,
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

async function expandMidQrChangeMethod(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
  });
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));
  expect(screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeInTheDocument();
}

describe('PaymentPage', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    mockCreatePayment.mockReset();
    mockCreatePayment.mockResolvedValue(sampleRetryPendingPayment);
    checkoutState.creatingPayment = false;
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

  // ---------------------------------------------------------------------------
  // Mid-QR journey spots (payment-page parent pattern)
  // ---------------------------------------------------------------------------
  // Parent harness uses vi.mock(useCheckout / usePayment / next/navigation) instead of MSW
  // createPayment GraphQL — intentional exception so PaymentPage.handleRetryPayment wiring
  // (createPayment → resolveNewPaymentId → router.push) is isolated from Apollo transport.
  // Fixture-e2e Journey 1 owns MSW createPayment multi-step coverage when promoted.
  //
  // Mid-QR AC-017: PromptPay restart → new paymentId + clear prior 3DS key
  // Journey AC: "When Mid-QR pending PromptPay is live, customer expands เปลี่ยนวิธีชำระเงิน,
  // submits PromptPay, and createPayment returns a NEW paymentId, then storefront clears prior
  // 3DS one-shot key and router.push(/payment/{newId}) — never thank-you from switch alone"
  // Behavior: expand Mid-QR → submit PromptPay → mockCreatePayment(same orderId) → mockPush new id;
  // prior 3DS session key cleared; thank-you replace not called
  // @category: integration
  // @lane: integration
  // @dependency: vi.mock parent-pattern intentional exception vs MSW — createPayment + creatingPayment
  //   via useCheckout mock; payment fixture via usePayment mock; MSW unused for createPayment here
  // @complexity: medium
  // ROI: covers SameOrderCreatePaymentRetry navigate + 3DS key clear at PaymentPage boundary
  it('Mid-QR submit navigates to new paymentId and clears prior 3DS key (AC-017)', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID), AUTHORIZE_URI);
    paymentState.payment = samplePendingPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await expandMidQrChangeMethod(user);
    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalledWith({
        orderId: CHECKOUT_ORDER_ID,
        amount: samplePendingPayment.amount,
        currency: 'THB',
        paymentMethod: 'promptpay',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
    });
    expect(mockPush).not.toHaveBeenCalledWith(`/payment/${CHECKOUT_PAYMENT_ID}`);
    expect(mockReplace).not.toHaveBeenCalledWith(`/thank-you/${CHECKOUT_ORDER_ID}`);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID))).toBeNull();
  });

  // Mid-QR method matrix: COD is not offered on payment change panel
  // @category: integration
  // @lane: integration
  it('Mid-QR change panel does not offer COD', async () => {
    const user = userEvent.setup();
    paymentState.payment = samplePendingPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await expandMidQrChangeMethod(user);

    expect(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /เก็บเงินปลายทาง/i })).not.toBeInTheDocument();
  });

  // Mid-QR AC-023: submit disabled while createPayment / retrySubmitting in flight
  // Journey AC: "While retrySubmitting (creatingPayment) is true on Mid-QR expanded panel,
  // submit ยืนยันการชำระเงิน is disabled"
  // Behavior: expand Mid-QR → drive checkoutState.creatingPayment=true (PaymentPage wires
  // retrySubmitting={creatingPayment}) → assert submit disabled. Deferred mockCreatePayment is
  // unused here because Apollo loading is not live under vi.mock; controllable creatingPayment
  // is the intentional parent-pattern way to assert the wiring.
  // @category: integration
  // @lane: integration
  // @dependency: vi.mock parent-pattern intentional exception vs MSW — controllable creatingPayment
  //   on useCheckout mock proves PaymentPage→retrySubmitting wiring (MSW cannot drive Apollo
  //   loading flag under this parent vi.mock harness)
  // @complexity: low
  // ROI: AC-023 double-submit guard at PaymentPage boundary (panel unit already covers localSubmitting)
  it('Mid-QR submit disabled while creatingPayment in flight (AC-023)', async () => {
    const user = userEvent.setup();
    paymentState.payment = samplePendingPayment;

    const { rerender } = render(<PaymentPage />, { wrapper: createWrapper() });

    await expandMidQrChangeMethod(user);
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeEnabled();

    checkoutState.creatingPayment = true;
    rerender(<PaymentPage />);

    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
  });

  // Mid-QR BC-1: same payment id stays expanded with error (no soft-success navigate)
  // Journey AC: "When Mid-QR createPayment returns the SAME paymentId, then inline error,
  // panel stays expanded, no router.push"
  // Behavior: expand → PromptPay submit → same-id mock → Thai same-id error; no push; QR still visible
  // @category: integration
  // @lane: integration
  // @dependency: vi.mock parent-pattern intentional exception vs MSW — createPayment resolved value
  //   shape controlled via useCheckout mock (same-id rejection is resolveNewPaymentId client path)
  // @complexity: medium
  // ROI: documents D002 soft-resume risk at PaymentPage Mid-QR boundary
  it('Mid-QR same payment id stays expanded with error and does not navigate (BC-1)', async () => {
    const user = userEvent.setup();
    mockCreatePayment.mockResolvedValue({
      ...samplePendingPayment,
      id: CHECKOUT_PAYMENT_ID,
    });
    paymentState.payment = samplePendingPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await expandMidQrChangeMethod(user);
    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(
        screen.getByText('ไม่สามารถสร้างการชำระเงินใหม่ได้ กรุณาลองใหม่อีกครั้ง'),
      ).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
  });

  // Mid-QR AC-011: fail-open success navigates new id without cancel-only blocking modal
  // Journey AC: "When createPayment returns a distinct new payment (cancel failure server-side /
  // fail-open), then navigate new id and never show a cancel-only blocking dialog"
  // Behavior: expand → PromptPay submit → new id → mockPush; no dialog / cancel-failure copy
  // @category: integration
  // @lane: integration
  // @dependency: vi.mock parent-pattern intentional exception vs MSW — fail-open is invisible on
  //   client (success payload only); cancel Omise side-effect not asserted here (N/A FE)
  // @complexity: low
  // ROI: AC-011 no cancel-only modal at PaymentPage Mid-QR success path
  it('Mid-QR fail-open success navigates new id without cancel-only blocking modal (AC-011)', async () => {
    const user = userEvent.setup();
    // Fail-open: createPayment still returns a distinct new payment (cancel failure is server-side).
    mockCreatePayment.mockResolvedValue(sampleRetryPendingPayment);
    paymentState.payment = samplePendingPayment;

    render(<PaymentPage />, { wrapper: createWrapper() });

    await expandMidQrChangeMethod(user);
    await submitPromptPayRetry(user);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/ยกเลิกการชำระเงินไม่สำเร็จ/i)).not.toBeInTheDocument();
  });
});
