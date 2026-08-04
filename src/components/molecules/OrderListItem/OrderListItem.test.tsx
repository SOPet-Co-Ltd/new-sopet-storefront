import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderListItem } from './OrderListItem';
import type { OrderSummary } from '@/lib/hooks/useOrders';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: vi.fn() }),
}));

function createOrder(status: string): OrderSummary {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status,
    createdAt: '2025-01-01T00:00:00.000Z',
    total: 950,
    items: [
      {
        id: 'item-1',
        productName: 'Test Product',
        quantity: 1,
      },
      {
        id: 'item-2',
        productName: 'Second Product',
        quantity: 2,
      },
    ],
  };
}

describe('OrderListItem', () => {
  it('renders purchased item names and quantities', () => {
    render(<OrderListItem order={createOrder('delivered')} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Second Product')).toBeInTheDocument();
    expect(screen.getByText('× 1')).toBeInTheDocument();
    expect(screen.getByText('× 2')).toBeInTheDocument();
    expect(screen.getByText('3 รายการ')).toBeInTheDocument();
  });

  it('renders pending_payment status label', () => {
    render(<OrderListItem order={createOrder('pending_payment')} />);
    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
  });

  it('renders legacy pending status label', () => {
    render(<OrderListItem order={createOrder('pending')} />);
    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
  });

  it('renders payment countdown for pending_payment orders', () => {
    render(<OrderListItem order={createOrder('pending_payment')} />);
    expect(screen.getByTestId('order-payment-countdown')).toBeInTheDocument();
  });

  it('renders payment countdown for legacy pending orders', () => {
    render(<OrderListItem order={createOrder('pending')} />);
    expect(screen.getByTestId('order-payment-countdown')).toBeInTheDocument();
  });

  it('does not render payment countdown for paid orders', () => {
    render(<OrderListItem order={createOrder('paid')} />);
    expect(screen.queryByTestId('order-payment-countdown')).not.toBeInTheDocument();
  });

  it('renders cancelled status with error badge variant', () => {
    render(<OrderListItem order={createOrder('cancelled')} />);

    const badge = screen.getByTestId('account-status-badge');
    expect(badge).toHaveTextContent('ยกเลิก');
    expect(badge).toHaveClass('bg-sop-system-error-100', 'text-sop-system-error-500');
  });

  it('renders delivered status with success badge variant', () => {
    render(<OrderListItem order={createOrder('delivered')} />);

    const badge = screen.getByTestId('account-status-badge');
    expect(badge).toHaveTextContent('ส่งสำเร็จ');
    expect(badge).toHaveClass('bg-sop-system-success-100', 'text-sop-system-success-500');
  });

  it('renders reviewed tag when all products are already reviewed', () => {
    render(<OrderListItem order={createOrder('delivered')} showReviewedTag />);

    expect(screen.getByText('รีวิวแล้ว')).toBeInTheDocument();
    expect(screen.getByText('ส่งสำเร็จ')).toBeInTheDocument();
  });

  it('does not render reviewed tag when showReviewedTag is false', () => {
    render(<OrderListItem order={createOrder('delivered')} />);

    expect(screen.queryByText('รีวิวแล้ว')).not.toBeInTheDocument();
  });
});
