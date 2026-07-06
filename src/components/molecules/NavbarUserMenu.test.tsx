import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavbarUserMenu } from './NavbarUserMenu';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

describe('NavbarUserMenu', () => {
  it('shows login link when guest on desktop', () => {
    mockedUseAuth.mockReturnValue({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      pendingDeletion: false,
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavbarUserMenu variant="desktop" />);

    expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('shows account menu trigger when authenticated on desktop', () => {
    mockedUseAuth.mockReturnValue({
      customer: {
        id: 'cust-1',
        phone: '0812345678',
        email: 'test@example.com',
        fullName: 'สมชาย ใจดี',
      },
      isAuthenticated: true,
      isLoading: false,
      pendingDeletion: false,
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavbarUserMenu variant="desktop" />);

    expect(
      screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย/ }),
    ).toBeInTheDocument();
  });
});
