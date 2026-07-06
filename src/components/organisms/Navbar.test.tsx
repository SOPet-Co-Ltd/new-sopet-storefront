import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../molecules/UnreadBadge', () => ({
  UnreadBadge: () => null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

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
