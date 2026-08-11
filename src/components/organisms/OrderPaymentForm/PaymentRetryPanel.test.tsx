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

  it('default: shows PromptPay and card only (no COD)', () => {
    render(<PaymentRetryPanel />);

    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /เก็บเงินปลายทาง/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeInTheDocument();
  });

  it('hidePromptPay: shows card only (mid-QR active wait)', () => {
    render(<PaymentRetryPanel hidePromptPay />);

    expect(screen.queryByRole('radio', { name: /QR Code \/ PromptPay/i })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
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

  it('locks method radios and card fields while confirm is in progress, then re-enables on failure', async () => {
    const user = userEvent.setup();
    const { tokenizeCard } = await import('@/lib/payment/omise');
    vi.mocked(tokenizeCard).mockResolvedValue('tok_test_lock');

    let rejectSubmit!: (error: Error) => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSubmit = reject;
        }),
    );
    const onSubmittingChange = vi.fn();

    render(<PaymentRetryPanel onSubmit={onSubmit} onSubmittingChange={onSubmittingChange} />);

    await user.click(screen.getByTestId('payment-method-card'));
    await user.type(screen.getByTestId('card-number-input'), '4242424242424242');
    await user.type(screen.getByTestId('card-name-input'), 'TEST USER');
    await user.type(screen.getByTestId('card-expiry-input'), '12/30');
    await user.type(screen.getByTestId('card-cvv-input'), '123');

    const cardNumberBeforeSubmit = (screen.getByTestId('card-number-input') as HTMLInputElement)
      .value;

    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    await waitFor(() => {
      expect(onSubmittingChange).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('card-number-input')).toBeDisabled();
      expect(screen.getByTestId('payment-method-promptpay')).toBeDisabled();
      expect(screen.getByTestId('payment-method-card')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
    });

    expect((screen.getByTestId('card-number-input') as HTMLInputElement).value).toBe(
      cardNumberBeforeSubmit,
    );

    rejectSubmit(new Error('ไม่สามารถสร้างการชำระเงินได้'));

    await waitFor(() => {
      expect(onSubmittingChange).toHaveBeenCalledWith(false);
      expect(screen.getByTestId('card-number-input')).not.toBeDisabled();
      expect(screen.getByTestId('payment-method-promptpay')).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).not.toBeDisabled();
    });

    expect((screen.getByTestId('card-number-input') as HTMLInputElement).value).toBe(
      cardNumberBeforeSubmit,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('ไม่สามารถสร้างการชำระเงินได้');
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

    await user.click(screen.getByTestId('payment-method-promptpay'));

    expect(screen.getByRole('alert')).toHaveTextContent('ไม่สามารถสร้างการชำระเงินได้');
    expect(screen.getByTestId('payment-method-promptpay')).toHaveAttribute('aria-checked', 'true');
  });

  it('external isSubmitting disables double-submit and card fields', async () => {
    const user = userEvent.setup();
    render(<PaymentRetryPanel isSubmitting />);

    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
    expect(screen.getByTestId('payment-method-promptpay')).toBeDisabled();
    expect(screen.getByTestId('payment-method-card')).toBeDisabled();

    // Card form mounts only after selection; external lock must still block method switch.
    await user.click(screen.getByTestId('payment-method-card'));
    expect(screen.queryByTestId('checkout-card-payment-form')).not.toBeInTheDocument();
  });

  it('external isSubmitting disables card form when card already selected', () => {
    render(<PaymentRetryPanel isSubmitting initialPaymentMethod="card" />);

    expect(screen.getByTestId('card-number-input')).toBeDisabled();
    expect(screen.getByTestId('card-name-input')).toBeDisabled();
    expect(screen.getByTestId('card-expiry-input')).toBeDisabled();
    expect(screen.getByTestId('card-cvv-input')).toBeDisabled();
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
