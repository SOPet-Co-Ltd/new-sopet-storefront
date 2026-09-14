import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavbarUserMenu } from './NavbarUserMenu';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
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

const guestAuth = {
  customer: null,
  isAuthenticated: false,
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
    mockedUseAuth.mockReturnValue(guestAuth);

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

  it('opens authenticated drawer with profile card and new nav items', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="desktop" />);

    await user.click(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย ใจดี/ }));

    const dialog = await screen.findByRole('dialog', { name: 'เมนูผู้ใช้' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('สมชาย ใจดี');
    expect(dialog).toHaveTextContent('สมาชิก Sopet');
    expect(screen.getByRole('link', { name: 'บัญชีของฉัน' })).toHaveAttribute(
      'href',
      '/user/profile',
    );

    expect(screen.getByRole('link', { name: /ตะกร้าสินค้า/ })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: /การแจ้งเตือน/ })).toHaveAttribute(
      'href',
      '/user/notifications',
    );
    expect(screen.getByRole('link', { name: /รายการโปรด/ })).toHaveAttribute(
      'href',
      '/user/favorites',
    );
    expect(screen.getByRole('link', { name: /ศูนย์ช่วยเหลือ/ })).toHaveAttribute(
      'href',
      'https://line.me/R/ti/p/@sopet',
    );
    expect(screen.getByRole('button', { name: /ออกจากระบบ/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'ข้อมูลส่วนตัว' })).not.toBeInTheDocument();
  });

  it('opens guest mobile drawer with login CTA and without logout', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(guestAuth);

    render(<NavbarUserMenu variant="mobile" />);

    await user.click(screen.getByRole('button', { name: 'เปิดเมนูผู้ใช้' }));

    expect(await screen.findByRole('dialog', { name: 'เมนูผู้ใช้' })).toBeInTheDocument();
    expect(screen.getByText('ยินดีต้อนรับสู่ Sopet 🐾')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ | ลงทะเบียน' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: /ตะกร้าสินค้า/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ออกจากระบบ/ })).not.toBeInTheDocument();
  });

  it('opens and closes mobile user menu drawer', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue(authenticatedAuth);

    render(<NavbarUserMenu variant="mobile" />);

    const openButton = screen.getByRole('button', { name: 'เปิดเมนูผู้ใช้' });
    expect(openButton).toBeInTheDocument();

    await user.click(openButton);

    expect(await screen.findByRole('dialog', { name: 'เมนูผู้ใช้' })).toBeInTheDocument();
    expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: 'ปิดเมนูผู้ใช้' });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(closeButtons[closeButtons.length - 1]);
  });
});
