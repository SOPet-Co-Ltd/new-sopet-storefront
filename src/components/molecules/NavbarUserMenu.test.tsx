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
  it('renders nothing when guest on desktop (auth CTAs live in promo bar)', () => {
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

    const { container } = render(<NavbarUserMenu variant="desktop" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows promo-bar account menu trigger when authenticated on desktop', () => {
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="desktop" />);

    const trigger = screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย ใจดี/ });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('สมชาย ใจดี');
  });

  it('opens side drawer with navbar segments when desktop trigger is clicked', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    const expectedItems = getNavItems('showInNavbarMenu');
    expect(expectedItems).toHaveLength(7);

    render(<NavbarUserMenu variant="desktop" />);

    await user.click(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย ใจดี/ }));

    expect(screen.getByRole('dialog', { name: 'เมนูผู้ใช้' })).toBeInTheDocument();

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

    await user.click(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย ใจดี/ }));

    const profileLink = screen.getByRole('link', { name: 'ข้อมูลส่วนตัว' });
    expect(profileLink.querySelector('svg')).toBeTruthy();
  });

  it('opens and closes mobile user menu drawer with full navigation items', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="mobile" />);

    const openButton = screen.getByRole('button', { name: 'เปิดเมนูผู้ใช้' });
    expect(openButton).toBeInTheDocument();

    await user.click(openButton);

    expect(screen.getByRole('dialog', { name: 'เมนูผู้ใช้' })).toBeInTheDocument();
    expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: 'ปิดเมนูผู้ใช้' });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(closeButtons[closeButtons.length - 1]);
  });
});
