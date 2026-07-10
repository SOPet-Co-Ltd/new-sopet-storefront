import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OrderDetailPage from './page';
import type { OrderDetail } from '@/lib/hooks/useOrders';

const { mockFetchOrder } = vi.hoisted(() => ({
  mockFetchOrder: vi.fn(),
}));

vi.mock('@/lib/hooks/useOrders', () => ({
  useOrders: () => ({
    fetchOrder: mockFetchOrder,
    confirmOrderDelivered: vi.fn(),
    confirmingDelivery: false,
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'order-1' }),
  usePathname: () => '/user/orders/order-1',
}));

function createOrder(status: string): OrderDetail {
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
  } as OrderDetail;
}

describe('OrderDetailPage', () => {
  it('renders pending_payment status label', async () => {
    mockFetchOrder.mockResolvedValue(createOrder('pending_payment'));

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
    });
  });

  it('renders legacy pending status label', async () => {
    mockFetchOrder.mockResolvedValue(createOrder('pending'));

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
    });
  });

  it('renders review CTA link when order is delivered', async () => {
    mockFetchOrder.mockResolvedValue(createOrder('delivered'));

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'เขียนรีวิว' })).toHaveAttribute(
        'href',
        '/user/reviews?tab=pending',
      );
    });
  });
});
