import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountLayout } from './AccountLayout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/orders',
  useRouter: () => ({ prefetch: vi.fn() }),
}));

describe('AccountLayout', () => {
  it('renders grid shell with sidebar and main content slots', () => {
    const { container } = render(
      <AccountLayout title="คำสั่งซื้อสินค้า">
        <p>Page content</p>
      </AccountLayout>,
    );

    const grid = container.querySelector('.lg\\:grid-cols-\\[240px_1fr\\]');
    expect(grid).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้' })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้ (มือถือ)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'คำสั่งซื้อสินค้า' })).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('keeps optional title prop contract', () => {
    render(<AccountLayout>Content only</AccountLayout>);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });
});
