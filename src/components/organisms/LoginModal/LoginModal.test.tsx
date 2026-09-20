import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginModalProvider, useLoginModal } from '@/lib/providers/LoginModalProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

const push = vi.fn();
const sendOtp = vi.fn().mockResolvedValue({ message: 'ok', referenceCode: '526547' });

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp,
    verifyOtp: vi.fn(),
    changeCustomerPhone: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/auth/otpPhone', () => ({
  storeOtpPhone: vi.fn(),
}));

import { storeOtpPhone } from '@/lib/auth/otpPhone';

const ApolloWrapper = createApolloTestWrapper();

function OpenButton() {
  const { openLoginModal } = useLoginModal();
  return (
    <button type="button" onClick={() => openLoginModal()}>
      open
    </button>
  );
}

function renderModal(ui?: React.ReactNode) {
  return render(
    <ApolloWrapper>
      <LoginModalProvider>{ui ?? <OpenButton />}</LoginModalProvider>
    </ApolloWrapper>,
  );
}

describe('LoginModal', () => {
  beforeEach(() => {
    push.mockClear();
    sendOtp.mockClear();
    vi.mocked(storeOtpPhone).mockClear();
    sessionStorage.clear();
    server.use(
      graphql.query('LoginPageImages', () =>
        HttpResponse.json({
          data: {
            loginPageImages: {
              desktopImageUrl: null,
              mobileImageUrl: null,
              altText: null,
            },
          },
        }),
      ),
    );
  });

  it('opens and closes', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByTestId('login-modal')).toBeInTheDocument();
    expect(screen.getByText('ยินดีต้อนรับสู่ SOPet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ปิด' }));
    await waitFor(() => {
      expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
    });
  });

  it('shows validation error for invalid phone', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: 'open' }));

    await user.click(screen.getByRole('button', { name: 'ดำเนินการต่อ' }));
    expect(await screen.findByText('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')).toBeInTheDocument();
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it('sends OTP and navigates to /login/otp on success', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: 'open' }));

    await user.type(screen.getByLabelText('เบอร์โทรศัพท์'), '0812345678');
    await user.click(screen.getByRole('button', { name: 'ดำเนินการต่อ' }));

    await waitFor(() => {
      expect(sendOtp).toHaveBeenCalledWith('0812345678');
      expect(storeOtpPhone).toHaveBeenCalledWith('0812345678', '526547');
      expect(push).toHaveBeenCalledWith('/login/otp');
    });
  });

  it('shows image fallback when no login images', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: 'open' }));

    expect(await screen.findByTestId('login-modal')).toBeInTheDocument();
    expect(screen.getAllByTestId('login-modal-image-fallback').length).toBeGreaterThan(0);
  });
});
