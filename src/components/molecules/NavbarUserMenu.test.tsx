import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavbarUserMenu } from './NavbarUserMenu';
import { getNavItems } from '@/components/templates/AccountLayout/accountNavConfig';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/account/prefetchAccountPage', () => ({
  createAccountPagePrefetchHandlers: () => ({}),
  prefetchAccountPage: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: vi.fn() }),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

const authenticatedAuth = {
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
  changeCustomerPhone: vi.fn(),
  reactivateAccount: vi.fn(),
  logout: vi.fn(),
};

describe('NavbarUserMenu', () => {
  it('shows login link when guest on desktop', () => {
    mockedUseAuth.mockReturnValue({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      pendingDeletion: false,
      sendOtp: vi.fn(),
      verifyOtp: vi.fn(),
      changeCustomerPhone: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });

    render(<NavbarUserMenu variant="desktop" />);

    expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toHaveAttribute('href', '/login');
  });

  it('shows account menu trigger when authenticated on desktop', () => {
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="desktop" />);

    expect(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย/ })).toBeInTheDocument();
  });

  it('renders exactly 7 navbar segments with correct hrefs and order', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    const expectedItems = getNavItems('showInNavbarMenu');
    expect(expectedItems).toHaveLength(7);

    render(<NavbarUserMenu variant="desktop" />);

    await user.click(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย/ }));

    const menuLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/user/'));

    expect(menuLinks).toHaveLength(7);

    expectedItems.forEach((item, index) => {
      expect(menuLinks[index]).toHaveAttribute('href', item.href);
      expect(menuLinks[index]).toHaveTextContent(item.label);
    });

    expect(
      screen.queryByRole('link', { name: /wishlist|รายการที่อยากได้/i }),
    ).not.toBeInTheDocument();
  });

  it('renders segment icons via NAVBAR_SEGMENT_ICONS overlay', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="desktop" />);

    await user.click(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย/ }));

    const profileLink = screen.getByRole('link', { name: 'ข้อมูลส่วนตัว' });
    expect(profileLink.querySelector('svg')).toBeTruthy();
  });
});
