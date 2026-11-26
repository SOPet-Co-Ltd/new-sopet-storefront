import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_TTL_AND_HALF_MS = OTP_TTL_MS + 30 * 1000;

describe('CheckoutExistingCustomerModal', () => {
  const sendOtp = vi.fn();
  const verifyOtp = vi.fn();
  const onClose = vi.fn();
  const onLoginSuccess = vi.fn();

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('shows expired message when OTP TTL elapses before typing', async () => {
    vi.useFakeTimers();
    sendOtp.mockResolvedValue({ message: 'ok', referenceCode: '526547' });

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('checkout-existing-customer-login-otp'));
    });

    expect(screen.getByTestId('checkout-existing-customer-otp-input')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(OTP_TTL_MS);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('รหัส OTP หมดอายุแล้ว');
    expect(screen.getByTestId('checkout-existing-customer-otp-resend')).toBeInTheDocument();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('AFOTP-Checkout-11: after 5½ minutes bypass 000000 shows expired and does not verify', async () => {
    vi.useFakeTimers();
    sendOtp.mockResolvedValue({ message: 'ok', referenceCode: '526547' });

    render(
      <CheckoutExistingCustomerModal
        open
        phone="0999999999"
        onClose={onClose}
        onLoginSuccess={onLoginSuccess}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('checkout-existing-customer-login-otp'));
    });

    expect(screen.getByTestId('checkout-existing-customer-otp-input')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(OTP_TTL_AND_HALF_MS);
    });

    const firstDigit = screen.getByTestId('checkout-existing-customer-otp-input-digit-1');
    fireEvent.change(firstDigit, { target: { value: '000000' } });

    expect(screen.getByRole('alert')).toHaveTextContent('รหัส OTP หมดอายุแล้ว');
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(screen.getByTestId('checkout-existing-customer-otp-resend')).toBeInTheDocument();
  });

  it('clears expired state after resend and allows bypass login', async () => {
    vi.useFakeTimers();
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

    await act(async () => {
      fireEvent.click(screen.getByTestId('checkout-existing-customer-login-otp'));
    });

    act(() => {
      vi.advanceTimersByTime(OTP_TTL_MS);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('รหัส OTP หมดอายุแล้ว');

    await act(async () => {
      fireEvent.click(screen.getByTestId('checkout-existing-customer-otp-resend'));
    });

    expect(sendOtp).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => {
      const firstDigit = screen.getByTestId('checkout-existing-customer-otp-input-digit-1');
      fireEvent.change(firstDigit, { target: { value: '000000' } });
      await Promise.resolve();
    });

    expect(verifyOtp).toHaveBeenCalledWith('0999999999', '000000');
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
  });
});
