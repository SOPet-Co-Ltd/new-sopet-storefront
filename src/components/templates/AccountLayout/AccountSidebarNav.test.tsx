import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountSidebarNav } from './AccountSidebarNav';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: vi.fn() }),
}));

describe('AccountSidebarNav', () => {
  it('renders sidebar nav with aria-label and sticky top-24', () => {
    render(<AccountSidebarNav pathname="/user/orders" />);

    const nav = screen.getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้' });
    expect(nav).toHaveClass('sticky', 'top-24');
    expect(nav.closest('aside')).toHaveClass('hidden', 'lg:block');
  });

  it('renders 9 sidebar destinations from getNavItems', () => {
    render(<AccountSidebarNav pathname="/user/orders" />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(9);
  });

  it('marks active item with aria-current on matching pathname', () => {
    render(<AccountSidebarNav pathname="/user/orders" />);

    const activeLink = screen.getByRole('link', { name: 'คำสั่งซื้อสินค้า' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('bg-sop-primary-200', 'text-sop-primary-600');
  });

  it('keeps reviews active for tab deep link pathname', () => {
    render(<AccountSidebarNav pathname="/user/reviews?tab=written" />);

    const reviewsLink = screen.getByRole('link', { name: 'รีวิวสินค้า' });
    expect(reviewsLink).toHaveAttribute('aria-current', 'page');
  });
});
