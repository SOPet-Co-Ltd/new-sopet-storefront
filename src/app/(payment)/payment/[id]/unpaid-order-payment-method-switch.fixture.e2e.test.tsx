// Unpaid Order Payment Method Switch fixture-e2e Test — Storefront Mid-QR recovery journey
// Design Doc: unpaid-order-payment-method-switch-frontend-design.md
// Backend Design Doc: unpaid-order-payment-method-switch-backend-design.md (createPayment contracts)
// UI Spec: unpaid-order-payment-method-switch-ui-spec.md (v1.1 golden states 1–11)
// PRD: unpaid-order-payment-method-switch-prd.md (AC-002, AC-005, AC-011, AC-016–AC-018, AC-023)
// Parent pattern: payment/[id]/payment-page.test.tsx + OrderPaymentForm.test.tsx WaitReturn cases
// Promoted from: unpaid-order-payment-method-switch.fixture.e2e.skeleton.tsx
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: GraphQL createPayment / payment — MSW (new-id / same-id / ORDER_NOT_PAYABLE)
// Mock: Omise.js tokenize — existing panel test doubles when card path exercised
// Mock: Next router.push — assert navigation target
// Mock: useSubscription — no WS in Vitest (same seam as usePayment.test.ts)
// @real-dependency: PaymentPage + OrderPaymentForm + PaymentRetryPanel (real UI tree)
// N/A on FE: backend Omise expire/cancel — assert navigation on success only (fail-open invisible)

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
} from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';
import {
  createPaymentOrderNotPayableHandler,
  createPaymentSameIdHandler,
  createPaymentSuccessHandler,
  failedPayment,
  midQrExpiredInterimPayment,
  midQrLivePayment,
  ORDER_NOT_PAYABLE_MESSAGE,
  paymentQueryHandler,
  waitReturnPayment,
  WAIT_RETURN_AUTHORIZE_URI,
} from '@/test/mocks/unpaid-order-payment-method-switch.handlers';

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useParams: () => ({ id: CHECKOUT_PAYMENT_ID }),
  usePathname: () => `/payment/${CHECKOUT_PAYMENT_ID}`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@apollo/client/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client/react')>();
  return {
    ...actual,
    useSubscription: () => ({
      data: undefined,
      error: undefined,
      loading: false,
    }),
  };
});

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

const createWrapper = createApolloTestWrapper;

async function expandMidQrChangeMethod(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
  });
  const cta = screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' });
  expect(cta).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();

  await user.click(cta);

  expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' })).toBeInTheDocument();
  expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
}

async function submitPromptPayRetry(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i }));
  await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));
}

describe('Unpaid order payment method switch — fixture-e2e', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPush.mockReset();
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
  });

  afterEach(() => {
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
  });

  // ---------------------------------------------------------------------------
  // Journey 1: Mid-QR CTA → createPayment → navigate new paymentId
  // ---------------------------------------------------------------------------
  describe('Journey 1 — Mid-QR createPayment navigates new paymentId', () => {
    it('PromptPay restart navigates to new paymentId and clears prior 3DS key (AC-005/017)', async () => {
      const user = userEvent.setup();
      let createVariables: unknown;
      sessionStorage.setItem(
        threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID),
        WAIT_RETURN_AUTHORIZE_URI,
      );

      server.use(
        paymentQueryHandler(midQrLivePayment),
        createPaymentSuccessHandler(undefined, {
          onVariables: (variables) => {
            createVariables = variables;
          },
        }),
      );

      render(<PaymentPage />, { wrapper: createWrapper() });

      await expandMidQrChangeMethod(user);
      await submitPromptPayRetry(user);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
      });
      expect(createVariables).toMatchObject({
        input: {
          orderId: CHECKOUT_ORDER_ID,
          amount: midQrLivePayment.amount,
          currency: 'THB',
          paymentMethod: 'promptpay',
        },
      });
      expect(mockPush).not.toHaveBeenCalledWith(`/payment/${CHECKOUT_PAYMENT_ID}`);
      expect(mockReplace).not.toHaveBeenCalledWith(`/thank-you/${CHECKOUT_ORDER_ID}`);
      expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID))).toBeNull();
      expect(screen.queryByText('ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...')).not.toBeInTheDocument();
    });

    it('change panel offers PromptPay and card only (no COD)', async () => {
      const user = userEvent.setup();

      server.use(paymentQueryHandler(midQrLivePayment));

      render(<PaymentPage />, { wrapper: createWrapper() });

      await expandMidQrChangeMethod(user);

      expect(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /เก็บเงินปลายทาง/i })).not.toBeInTheDocument();
    });

    it('fail-open success navigates new id without cancel-only blocking modal (AC-011)', async () => {
      const user = userEvent.setup();

      server.use(paymentQueryHandler(midQrLivePayment), createPaymentSuccessHandler());

      render(<PaymentPage />, { wrapper: createWrapper() });

      await expandMidQrChangeMethod(user);
      await submitPromptPayRetry(user);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(/ยกเลิกการชำระเงินไม่สำเร็จ/i)).not.toBeInTheDocument();
    });

    it('same payment id stays expanded with error and does not navigate (BC-1 / D002)', async () => {
      const user = userEvent.setup();

      server.use(paymentQueryHandler(midQrLivePayment), createPaymentSameIdHandler());

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

    it('submit is disabled while createPayment is in flight (AC-023)', async () => {
      const user = userEvent.setup();

      server.use(
        paymentQueryHandler(midQrLivePayment),
        createPaymentSuccessHandler(undefined, { delayMs: 250 }),
      );

      render(<PaymentPage />, { wrapper: createWrapper() });

      await expandMidQrChangeMethod(user);
      await user.click(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i }));
      const submit = screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' });
      expect(submit).toBeEnabled();

      await user.click(submit);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/payment/${CHECKOUT_RETRY_PAYMENT_ID}`);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Journey 2: Ineligible createPayment → retrySubmitError, stay on page
  // ---------------------------------------------------------------------------
  describe('Journey 2 — ORDER_NOT_PAYABLE stays with error (AC-002)', () => {
    it('ineligible createPayment shows error, keeps panel, does not navigate', async () => {
      const user = userEvent.setup();

      server.use(paymentQueryHandler(midQrLivePayment), createPaymentOrderNotPayableHandler());

      render(<PaymentPage />, { wrapper: createWrapper() });

      await expandMidQrChangeMethod(user);
      // Server-authoritative: CTA was shown on live pending QR (no client order.status hide)
      expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toBeInTheDocument();

      await submitPromptPayRetry(user);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(ORDER_NOT_PAYABLE_MESSAGE);
      });
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Journey 3: Preserve Failed + WaitReturn + QR-expired interim unmount
  // ---------------------------------------------------------------------------
  describe('Journey 3 — preserve Failed / WaitReturn / interim no Mid-QR CTA (AC-018)', () => {
    it('Failed payment mounts PaymentRetryPanel without Mid-QR CTA click', async () => {
      server.use(paymentQueryHandler(failedPayment));

      render(<PaymentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' })).toHaveClass(
        'text-gray-900',
      );
    });

    it('WaitReturn collapsed CTA expands PaymentRetryPanel', async () => {
      const user = userEvent.setup();
      sessionStorage.setItem(
        threeDSAutoRedirectStorageKey(CHECKOUT_PAYMENT_ID),
        WAIT_RETURN_AUTHORIZE_URI,
      );

      server.use(paymentQueryHandler(waitReturnPayment));

      render(<PaymentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('payment-waiting-after-return')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));

      expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' })).toBeInTheDocument();
    });

    it('QR-expired interim shows amber alert and does not mount Mid-QR CTA', async () => {
      server.use(paymentQueryHandler(midQrExpiredInterimPayment));

      render(<PaymentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('QR Code หมดอายุแล้ว กำลังอัปเดตสถานะ...')).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'PromptPay QR Code' })).not.toBeInTheDocument();
    });
  });
});
