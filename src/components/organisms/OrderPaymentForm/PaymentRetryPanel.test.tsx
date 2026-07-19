import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentRetryPanel } from './PaymentRetryPanel';
import { PaymentFailedState } from './PaymentFailedState';
import { PaymentWaitingAfterReturnState } from './PaymentWaitingAfterReturnState';

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

vi.mock('@/lib/payment/omise', async () => {
  const actual = await vi.importActual<typeof import('@/lib/payment/omise')>('@/lib/payment/omise');
  return {
    ...actual,
    tokenizeCard: vi.fn(),
  };
});

describe('PaymentRetryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('default: shows method options including PromptPay, card, and COD', () => {
    render(<PaymentRetryPanel />);

    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /เก็บเงินปลายทาง/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeInTheDocument();
  });

  it('heading uses text-gray-900 for AA contrast (UI Spec lock)', () => {
    render(<PaymentRetryPanel />);

    const heading = screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' });
    expect(heading).toHaveClass('sop-body-lg-medium');
    expect(heading).toHaveClass('text-gray-900');
    expect(heading).not.toHaveClass('text-sop-primary-500');
  });

  it('empty saved cards → new-card form only when card selected (empty state)', async () => {
    const user = userEvent.setup();
    render(<PaymentRetryPanel />);

    await user.click(screen.getByTestId('payment-method-card'));

    expect(screen.getByTestId('checkout-card-payment-form')).toBeInTheDocument();
    expect(screen.queryByText('บัตรที่บันทึกไว้')).not.toBeInTheDocument();
  });

  it('loading: disables submit and shows loading while in-flight (double-submit guard)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 200);
        }),
    );

    render(<PaymentRetryPanel onSubmit={onSubmit} />);

    await user.click(screen.getByTestId('payment-method-promptpay'));
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    const submitButton = screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('empty input: submitting card with empty fields shows validation and does not fire onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PaymentRetryPanel onSubmit={onSubmit} />);

    await user.click(screen.getByTestId('payment-method-card'));
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    expect(screen.getByText('กรุณากรอกหมายเลขบัตร')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('invalid option: unsupported payment method is rejected and onSubmit not fired', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PaymentRetryPanel onSubmit={onSubmit} initialPaymentMethod={'paypal' as never} />);

    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported payment method|ไม่รองรับ/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('error: surfaces submitError while preserving selected method', async () => {
    const user = userEvent.setup();
    render(<PaymentRetryPanel submitError="ไม่สามารถสร้างการชำระเงินได้" />);

    await user.click(screen.getByTestId('payment-method-cod'));

    expect(screen.getByRole('alert')).toHaveTextContent('ไม่สามารถสร้างการชำระเงินได้');
    expect(screen.getByTestId('payment-method-cod')).toHaveAttribute('aria-checked', 'true');
  });

  it('external isSubmitting disables double-submit', () => {
    render(<PaymentRetryPanel isSubmitting />);

    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
  });
});

describe('PaymentFailedState entry (expanded by default)', () => {
  it('renders PaymentRetryPanel expanded without requiring CTA click', () => {
    render(<PaymentFailedState isQrExpired={false} />);

    expect(screen.getByText('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
  });
});

describe('PaymentWaitingAfterReturnState entry (collapsed)', () => {
  it('hides PaymentRetryPanel behind เปลี่ยนวิธีชำระเงิน until expanded', async () => {
    const user = userEvent.setup();
    render(
      <PaymentWaitingAfterReturnState
        authorizeUri="https://pay.omise.co/offsites/ofsp_test/pay"
        amountLabel="฿100.00"
      />,
    );

    expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));

    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('payment-retry-stub')).not.toBeInTheDocument();
  });
});
