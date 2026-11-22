import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutExistingCustomerModal } from './CheckoutExistingCustomerModal';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    ...props
  }: {
    alt: string;
    src: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...props} />
  ),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

describe('CheckoutExistingCustomerModal', () => {
  const sendOtp = vi.fn();
  const verifyOtp = vi.fn();
  const onClose = vi.fn();
  const onLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      pendingDeletion: false,
      sendOtp,
      verifyOtp,
      changeCustomerPhone: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders account-found prompt copy and actions', () => {
    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    expect(screen.getByText('ยินดีต้อนรับลูกค้า Sopet')).toBeInTheDocument();
    expect(screen.getByText(/พบว่าเบอร์นี้มีบัญชีอยู่แล้ว/)).toBeInTheDocument();
    expect(screen.getByTestId('checkout-existing-customer-login-otp')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-existing-customer-continue-guest')).toBeInTheDocument();
  });

  it('closes when continue as guest is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await user.click(screen.getByTestId('checkout-existing-customer-continue-guest'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sends OTP and switches to OTP step with formatted phone', async () => {
    const user = userEvent.setup();
    sendOtp.mockResolvedValue({ message: 'ok', referenceCode: '526547' });

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await user.click(screen.getByTestId('checkout-existing-customer-login-otp'));

    await waitFor(() => {
      expect(screen.getByTestId('checkout-existing-customer-otp')).toBeInTheDocument();
    });

    expect(sendOtp).toHaveBeenCalledWith('0999999999');
    expect(screen.getByText('ยืนยันรหัส OTP')).toBeInTheDocument();
    expect(screen.getByText('รหัสถูกส่งไปที่เบอร์ 099-999-9999')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-existing-customer-otp-reference')).toHaveTextContent(
      'รหัสอ้างอิง: 526547',
    );
  });

  it('stays on OTP step and shows error with purple resend when verify fails', async () => {
    const user = userEvent.setup();
    sendOtp.mockResolvedValue({ message: 'ok', referenceCode: '526547' });
    verifyOtp.mockRejectedValue({
      code: 'INVALID_OTP',
      message: 'INVALID_OTP',
    });

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await user.click(screen.getByTestId('checkout-existing-customer-login-otp'));
    await waitFor(() => {
      expect(screen.getByTestId('checkout-existing-customer-otp-input')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('checkout-existing-customer-otp-input-digit-1'), '123456');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      );
    });

    expect(screen.getByTestId('checkout-existing-customer-otp-resend')).toHaveTextContent(
      'ส่งใหม่อีกครั้ง',
    );
    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(screen.getByTestId('checkout-existing-customer-otp')).toBeInTheDocument();
  });

  it('calls onLoginSuccess when OTP verifies', async () => {
    const user = userEvent.setup();
    sendOtp.mockResolvedValue({ message: 'ok', referenceCode: '526547' });
    verifyOtp.mockResolvedValue({
      pendingDeletion: false,
      customer: { id: 'c1', phone: '0999999999' },
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await user.click(screen.getByTestId('checkout-existing-customer-login-otp'));
    await waitFor(() => {
      expect(screen.getByTestId('checkout-existing-customer-otp-input')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('checkout-existing-customer-otp-input-digit-1'), '123456');

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
