import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentRetryPanel } from './PaymentRetryPanel';
import { PaymentFailedState } from './PaymentFailedState';
import { PaymentWaitingAfterReturnState } from './PaymentWaitingAfterReturnState';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

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

function renderWithApollo(ui: React.ReactElement) {
  const Wrapper = createApolloTestWrapper();
  return render(<Wrapper>{ui}</Wrapper>);
}

describe('PaymentRetryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('default: shows PromptPay and card only (no COD, no bank transfer when disabled)', async () => {
    renderWithApollo(<PaymentRetryPanel />);

    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /QR Code \/ PromptPay/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /เก็บเงินปลายทาง/i })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId('payment-method-bank_transfer')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeInTheDocument();
  });

  it('shows bank_transfer when admin bank details are configured', async () => {
    server.use(
      graphql.query('BankTransferDetails', () =>
        HttpResponse.json({
          data: {
            bankTransferDetails: {
              bankName: 'ธนาคารกสิกรไทย',
              accountName: 'SOPET',
              accountNumber: '123-4-56789-0',
            },
          },
        }),
      ),
    );

    renderWithApollo(<PaymentRetryPanel />);

    expect(await screen.findByTestId('payment-method-bank_transfer')).toBeInTheDocument();
  });

  it('hideBankTransfer: omits bank transfer even when configured', async () => {
    server.use(
      graphql.query('BankTransferDetails', () =>
        HttpResponse.json({
          data: {
            bankTransferDetails: {
              bankName: 'ธนาคารกสิกรไทย',
              accountName: 'SOPET',
              accountNumber: '123-4-56789-0',
            },
          },
        }),
      ),
    );

    renderWithApollo(<PaymentRetryPanel hideBankTransfer />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-method-card')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('payment-method-bank_transfer')).not.toBeInTheDocument();
  });

  it('submits bank_transfer when selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    server.use(
      graphql.query('BankTransferDetails', () =>
        HttpResponse.json({
          data: {
            bankTransferDetails: {
              bankName: 'ธนาคารกสิกรไทย',
              accountName: 'SOPET',
              accountNumber: '123-4-56789-0',
            },
          },
        }),
      ),
    );

    renderWithApollo(<PaymentRetryPanel onSubmit={onSubmit} />);

    await user.click(await screen.findByTestId('payment-method-bank_transfer'));
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ paymentMethod: 'bank_transfer' }));
  });

  it('hidePromptPay: shows card only (mid-QR active wait)', () => {
    renderWithApollo(<PaymentRetryPanel hidePromptPay />);

    expect(screen.queryByRole('radio', { name: /QR Code \/ PromptPay/i })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /บัตรเครดิต\/บัตรเดบิต/i })).toBeInTheDocument();
  });

  it('heading uses text-gray-900 for AA contrast (UI Spec lock)', () => {
    renderWithApollo(<PaymentRetryPanel />);

    const heading = screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' });
    expect(heading).toHaveClass('sop-body-lg-medium');
    expect(heading).toHaveClass('text-gray-900');
    expect(heading).not.toHaveClass('text-sop-primary-500');
  });

  it('empty saved cards → new-card form only when card selected (empty state)', async () => {
    const user = userEvent.setup();
    renderWithApollo(<PaymentRetryPanel />);

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

    renderWithApollo(<PaymentRetryPanel onSubmit={onSubmit} />);

    await user.click(screen.getByTestId('payment-method-promptpay'));
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    const submitButton = screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('onSubmittingChange fires true then false when submit fails', async () => {
    const user = userEvent.setup();
    const onSubmittingChange = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('create failed'));

    renderWithApollo(
      <PaymentRetryPanel onSubmit={onSubmit} onSubmittingChange={onSubmittingChange} />,
    );

    await user.click(screen.getByTestId('payment-method-promptpay'));
    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmittingChange).toHaveBeenCalledWith(true);
    await waitFor(() => expect(onSubmittingChange).toHaveBeenCalledWith(false));
  });

  it('invalid option: unsupported payment method is rejected and onSubmit not fired', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithApollo(
      <PaymentRetryPanel onSubmit={onSubmit} initialPaymentMethod={'paypal' as never} />,
    );

    await user.click(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported payment method|ไม่รองรับ/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('error: surfaces submitError while preserving selected method', async () => {
    const user = userEvent.setup();
    renderWithApollo(<PaymentRetryPanel submitError="ไม่สามารถสร้างการชำระเงินได้" />);

    await user.click(screen.getByTestId('payment-method-promptpay'));

    expect(screen.getByRole('alert')).toHaveTextContent('ไม่สามารถสร้างการชำระเงินได้');
    expect(screen.getByTestId('payment-method-promptpay')).toHaveAttribute('aria-checked', 'true');
  });

  it('external isSubmitting disables double-submit and card fields', async () => {
    const user = userEvent.setup();
    renderWithApollo(<PaymentRetryPanel isSubmitting />);

    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
    expect(screen.getByTestId('payment-method-promptpay')).toBeDisabled();
    expect(screen.getByTestId('payment-method-card')).toBeDisabled();

    // Card form mounts only after selection; external lock must still block method switch.
    await user.click(screen.getByTestId('payment-method-card'));
    expect(screen.queryByTestId('checkout-card-payment-form')).not.toBeInTheDocument();
  });

  it('external isSubmitting disables card form when card already selected', () => {
    renderWithApollo(<PaymentRetryPanel isSubmitting initialPaymentMethod="card" />);

    expect(screen.getByTestId('card-number-input')).toBeDisabled();
    expect(screen.getByTestId('card-name-input')).toBeDisabled();
    expect(screen.getByTestId('card-expiry-input')).toBeDisabled();
    expect(screen.getByTestId('card-cvv-input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeDisabled();
  });
});

describe('PaymentFailedState entry (expanded by default)', () => {
  it('renders PaymentRetryPanel expanded without requiring CTA click', () => {
    renderWithApollo(<PaymentFailedState isQrExpired={false} />);

    expect(screen.getByText('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
  });
});

describe('PaymentWaitingAfterReturnState entry (collapsed)', () => {
  it('hides PaymentRetryPanel behind เปลี่ยนวิธีชำระเงิน until expanded', async () => {
    const user = userEvent.setup();
    renderWithApollo(
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
