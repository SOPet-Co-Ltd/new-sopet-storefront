import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountMobileNav } from './AccountMobileNav';

describe('AccountMobileNav', () => {
  it('renders mobile nav with aria-label and sticky top-20', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const nav = screen.getByRole('navigation', { name: 'เมนูบัญชีผู้ใช้ (มือถือ)' });
    expect(nav).toHaveClass('sticky', 'top-20', 'lg:hidden');
  });

  it('renders 10 mobile nav destinations', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(10);
  });

  it('applies active chip token classes on matching pathname', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const activeLink = screen.getByRole('link', { name: 'คำสั่งซื้อสินค้า' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('bg-sop-primary-200', 'text-sop-primary-600');
  });

  it('applies inactive chip token classes', () => {
    render(<AccountMobileNav pathname="/user/orders" />);

    const inactiveLink = screen.getByRole('link', { name: 'ข้อมูลส่วนตัว' });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
    expect(inactiveLink).toHaveClass('bg-sop-neutral-gray-500', 'text-sop-neutral-gray-300');
  });
});
