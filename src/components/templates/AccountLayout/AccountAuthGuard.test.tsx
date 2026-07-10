'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountAuthGuard } from '@/components/templates/AccountLayout/AccountAuthGuard';

const { mockUseAuth, mockReplace } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockReplace: vi.fn(),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/account/prefetchAccountPage', () => ({
  prefetchAllAccountPages: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/user/orders',
}));

describe('AccountAuthGuard', () => {
  it('shows loading state while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: true });

    render(
      <AccountAuthGuard>
        <div>protected</div>
      </AccountAuthGuard>,
    );

    expect(screen.getByTestId('account-auth-loading')).toBeTruthy();
    expect(screen.queryByText('protected')).toBeNull();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    render(
      <AccountAuthGuard>
        <div>protected</div>
      </AccountAuthGuard>,
    );

    expect(screen.getByText('protected')).toBeTruthy();
  });
});
