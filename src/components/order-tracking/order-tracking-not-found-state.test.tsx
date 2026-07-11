import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderTrackingNotFoundState } from './order-tracking-not-found-state';

describe('OrderTrackingNotFoundState', () => {
  it('renders locked Thai copy and home link', () => {
    render(<OrderTrackingNotFoundState />);

    expect(screen.getByRole('heading', { level: 1, name: 'ไม่พบคำสั่งซื้อ' })).toBeInTheDocument();
    expect(
      screen.getByText('ไม่พบคำสั่งซื้อที่คุณค้นหา กรุณาตรวจสอบลิงก์จากผู้ขายอีกครั้ง'),
    ).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'กลับหน้าหลัก' });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
