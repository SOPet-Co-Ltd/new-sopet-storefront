import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AccountMobileNav } from './AccountMobileNav';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: vi.fn() }),
}));

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

describe('AccountMobileNav', () => {
  it('renders mobile nav at page top without sticky positioning', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const nav = screen.getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้ (มือถือ)' });
    expect(nav).toHaveClass('border-b', 'bg-sop-base-white', 'lg:hidden');
    expect(nav).not.toHaveClass('sticky', 'top-20', 'z-10');
  });

  it('renders 8 mobile nav destinations', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(8);
  });

  it('applies active chip token classes on matching pathname', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const activeLink = screen.getByRole('link', { name: 'คำสั่งซื้อสินค้า' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('bg-sop-primary-200', 'text-sop-primary-600');
  });

  it('renders horizontally scrollable chip row', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const scrollContainer = screen
      .getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้ (มือถือ)' })
      .querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('snap-x', 'touch-pan-x');
  });

  it('prevents nav chips from shrinking', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const link = screen.getByRole('link', { name: 'ข้อมูลส่วนตัว' });
    expect(link).toHaveClass('shrink-0', 'whitespace-nowrap');
  });

  it('applies inactive chip token classes', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const inactiveLink = screen.getByRole('link', { name: 'ข้อมูลส่วนตัว' });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
    expect(inactiveLink).toHaveClass('bg-sop-neutral-gray-500', 'text-sop-neutral-gray-300');
  });
});
