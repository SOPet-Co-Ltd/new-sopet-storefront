import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderListItem } from './OrderListItem';
import type { OrderSummary } from '@/lib/hooks/useOrders';

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
});
