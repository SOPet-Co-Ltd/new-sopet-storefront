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
    subtotal: 900,
    shippingFee: 50,
    discountAmount: 0,
    total: 950,
    paymentMethod: 'credit_card',
    items: [
      {
        id: 'item-1',
        variantId: 'variant-1',
        storeId: 'store-1',
        productName: 'Test Product',
        unitPrice: 900,
        quantity: 1,
        subtotal: 900,
        fulfillmentStatus: 'pending',
        trackingNumber: null,
        fulfillmentProvider: null,
        trackingUrl: null,
      },
    ],
    storeShippings: [],
  } as OrderSummary;
}

describe('OrderListItem', () => {
  it('renders pending_payment status label', () => {
    render(<OrderListItem order={createOrder('pending_payment')} />);
    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
  });

  it('renders legacy pending status label', () => {
    render(<OrderListItem order={createOrder('pending')} />);
    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
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
});
