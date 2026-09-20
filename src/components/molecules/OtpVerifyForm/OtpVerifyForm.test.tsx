import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OtpVerifyForm } from './OtpVerifyForm';

const replace = vi.fn();
const sendOtp = vi.fn().mockResolvedValue({ message: 'ok', referenceCode: '999888' });
const verifyOtp = vi.fn().mockResolvedValue({
  customer: { id: '1' },
  pendingDeletion: false,
  tokens: { accessToken: 'a', refreshToken: 'r' },
});
const openLoginModal = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src={typeof src === 'string' ? src : ''} alt={alt} {...props} />
  ),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp,
    verifyOtp,
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/providers/LoginModalProvider', () => ({
  useLoginModal: () => ({
    isOpen: false,
    notice: null,
    openLoginModal,
    closeLoginModal: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('OtpVerifyForm', () => {
  beforeEach(() => {
    replace.mockClear();
    sendOtp.mockClear();
    verifyOtp.mockClear();
    openLoginModal.mockClear();
    sessionStorage.clear();
  });

  it('redirects to login when phone is missing', async () => {
    render(<OtpVerifyForm />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login');
    });
  });

  it('shows phone, reference code, and disables resend during cooldown', async () => {
    sessionStorage.setItem('sopet_otp_phone', '0888888888');
    sessionStorage.setItem('sopet_otp_reference', '526547');

    render(<OtpVerifyForm />);

    expect(await screen.findByTestId('otp-verify-form')).toBeInTheDocument();
    expect(screen.getByText(/รหัสถูกส่งทาง SMS ไปยังเบอร์โทร/)).toBeInTheDocument();
    expect(screen.getByTestId('otp-reference-code')).toHaveTextContent('รหัสอ้างอิง: 526547');
    expect(screen.getByTestId('otp-resend-button')).toBeDisabled();
    expect(screen.getByText(/ส่งใหม่อีกครั้งภายใน/)).toBeInTheDocument();
  });

  it('goes back to home and opens login modal', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('sopet_otp_phone', '0888888888');
    sessionStorage.setItem('sopet_otp_reference', '526547');

    render(<OtpVerifyForm />);
    await screen.findByTestId('otp-verify-form');

    await user.click(screen.getByTestId('otp-back-button'));

    expect(sessionStorage.getItem('sopet_otp_phone')).toBeNull();
    expect(openLoginModal).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('auto-verifies when six digits are entered', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('sopet_otp_phone', '0888888888');
    sessionStorage.setItem('sopet_otp_reference', '526547');

    render(<OtpVerifyForm />);
    await screen.findByTestId('otp-verify-form');

    await user.type(screen.getByTestId('otp-code-input-digit-1'), '123456');

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith('0888888888', '123456');
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/');
    });
  });
});
