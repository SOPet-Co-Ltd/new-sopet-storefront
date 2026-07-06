import { ApolloProvider } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuestOTPDialog } from '@/components/organisms/GuestOTPDialog/GuestOTPDialog';
import { getApolloClient } from '@/lib/graphql/client';

const mockSendOtp = vi.fn();
const mockVerifyOtp = vi.fn();

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: mockSendOtp,
    verifyOtp: mockVerifyOtp,
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  }),
}));

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ApolloProvider, { client }, children);
  };
}

describe('GuestOTPDialog', () => {
  beforeEach(() => {
    mockSendOtp.mockReset();
    mockVerifyOtp.mockReset();
    mockSendOtp.mockResolvedValue({ message: 'sent' });
    mockVerifyOtp.mockResolvedValue({ tokens: null, pendingDeletion: false });
  });

  afterEach(async () => {
    await getApolloClient().clearStore();
  });

  it('opens for anonymous checkout and closes after successful OTP verification', async () => {
    const user = userEvent.setup();
    const onVerified = vi.fn();

    render(
      <GuestOTPDialog isOpen initialPhone="0812345678" onVerified={onVerified} />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockSendOtp).toHaveBeenCalledWith('0812345678');
    });

    expect(screen.getByTestId('guest-otp-dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('รหัส OTP หลักที่ 1')).toBeInTheDocument();

    const otpInputs = Array.from({ length: 6 }, (_, index) =>
      screen.getByLabelText(`รหัส OTP หลักที่ ${index + 1}`),
    );

    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    await user.type(otpInputs[2], '3');
    await user.type(otpInputs[3], '4');
    await user.type(otpInputs[4], '5');
    await user.type(otpInputs[5], '6');

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith('0812345678', '123456');
    });

    await waitFor(
      () => {
        expect(onVerified).toHaveBeenCalledWith('0812345678');
      },
      { timeout: 3_000 },
    );
  });

  it('shows Thai inline OTP error message when verification fails', async () => {
    const user = userEvent.setup();
    mockVerifyOtp.mockRejectedValueOnce(new Error('invalid otp'));

    render(
      <GuestOTPDialog isOpen initialPhone="0812345678" onVerified={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByLabelText('รหัส OTP หลักที่ 1')).toBeInTheDocument();
    });

    const otpInputs = Array.from({ length: 6 }, (_, index) =>
      screen.getByLabelText(`รหัส OTP หลักที่ ${index + 1}`),
    );

    await user.type(otpInputs[0], '9');
    await user.type(otpInputs[1], '9');
    await user.type(otpInputs[2], '9');
    await user.type(otpInputs[3], '9');
    await user.type(otpInputs[4], '9');
    await user.type(otpInputs[5], '9');

    await waitFor(() => {
      expect(
        screen.getByRole('alert', { name: undefined }),
      ).toHaveTextContent('รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    });
  });
});
