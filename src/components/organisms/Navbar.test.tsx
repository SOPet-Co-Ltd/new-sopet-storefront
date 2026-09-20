import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: vi.fn(),
}));

vi.mock('@/lib/providers/LoginModalProvider', () => ({
  useLoginModal: vi.fn(),
}));

vi.mock('../molecules/UnreadBadge', () => ({
  UnreadBadge: () => null,
}));

vi.mock('../molecules/NavbarSearch', () => ({
  NavbarSearch: () => <div data-testid="navbar-search-mock" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/providers/CartProvider';
import { useLoginModal } from '@/lib/providers/LoginModalProvider';

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseCart = vi.mocked(useCart);
const mockedUseLoginModal = vi.mocked(useLoginModal);
const openLoginModal = vi.fn();

describe('Navbar', () => {
  beforeEach(() => {
    openLoginModal.mockClear();
    mockedUseLoginModal.mockReturnValue({
      isOpen: false,
      notice: null,
      openLoginModal,
      closeLoginModal: vi.fn(),
    });
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
    mockedUseCart.mockReturnValue({
      cart: null,
      items: [],
      itemsByStore: [],
      itemCount: 0,
      subtotal: 0,
      selectedItems: [],
      selectedItemsByStore: [],
      selectedItemCount: 0,
      selectedSubtotal: 0,
      allItemsSelected: false,
      isItemSelected: vi.fn(() => true),
      isStoreSelected: vi.fn(() => false),
      toggleItemSelected: vi.fn(),
      setStoreSelected: vi.fn(),
      setAllSelected: vi.fn(),
      loading: false,
      error: undefined,
      warnings: [],
      hasSuspendedStoreItemRemovedWarning: false,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      changeItemVariant: vi.fn(),
      removeItem: vi.fn(),
      pruneDeselectedIds: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('links cart to /cart and omits /coupons links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'ตะกร้าสินค้า' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'ตะกร้าสินค้า' })).toHaveAttribute(
      'data-fly-to-cart-target',
    );

    expect(screen.queryByRole('link', { name: /coupons/i })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('/coupons');
  });

  it('shows membership promo copy and opens login modal from CTA', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.getByText(/สมัครสมาชิก/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sopet สนับสนุนโดยสถาบันนวัตกรรมบูรณาการแห่งจุฬาฯ (CSII)/),
    ).toBeInTheDocument();

    const trackStatus = screen.getByRole('link', { name: 'ติดตามสถานะผ่าน LINE' });
    expect(trackStatus).toHaveAttribute('href', 'https://line.me/R/ti/p/@sopet');
    expect(trackStatus).toHaveAttribute('target', '_blank');

    await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ | ลงทะเบียน' }));
    expect(openLoginModal).toHaveBeenCalled();
  });

  it('shows promo-bar user menu when authenticated and hides guest login button', () => {
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
      changeCustomerPhone: vi.fn(),
      reactivateAccount: vi.fn(),
      logout: vi.fn(),
    });

    render(<Navbar />);

    expect(
      screen.queryByRole('button', { name: 'เข้าสู่ระบบ | ลงทะเบียน' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /เมนูผู้ใช้: สมชาย ใจดี/ })).toBeInTheDocument();
  });
});
