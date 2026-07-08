import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: vi.fn(),
}));

vi.mock('../molecules/UnreadBadge', () => ({
  UnreadBadge: () => null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/providers/CartProvider';

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseCart = vi.mocked(useCart);

describe('Navbar', () => {
  beforeEach(() => {
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
      addItem: vi.fn(),
      updateItem: vi.fn(),
      changeItemVariant: vi.fn(),
      removeItem: vi.fn(),
      refetch: vi.fn(),
    });
  });
  it('links cart to /cart and omits /coupons links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'ตะกร้าสินค้า' })).toHaveAttribute(
      'href',
      '/cart',
    );

    expect(screen.queryByRole('link', { name: /coupons/i })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('/coupons');
  });
});
