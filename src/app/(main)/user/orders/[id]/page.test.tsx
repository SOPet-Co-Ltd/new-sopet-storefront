import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderDetailPage from './page';
import type { OrderDetail } from '@/lib/hooks/useOrders';

const { mockUseOrderDetail, mockUseOrderPendingReviews } = vi.hoisted(() => ({
  mockUseOrderDetail: vi.fn(),
  mockUseOrderPendingReviews: vi.fn(),
}));

vi.mock('@/lib/hooks/useOrders', () => ({
  useOrderDetail: (...args: unknown[]) => mockUseOrderDetail(...args),
}));

vi.mock('@/lib/hooks/useOrderPendingReviews', () => ({
  useOrderPendingReviews: (...args: unknown[]) => mockUseOrderPendingReviews(...args),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'order-1' }),
  usePathname: () => '/user/orders/order-1',
  useRouter: () => ({ prefetch: vi.fn() }),
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
        productId: 'product-1',
        productImageUrl: null,
        unitPrice: 900,
        quantity: 1,
        subtotal: 900,
        fulfillmentStatus: 'pending',
        trackingNumber: null,
        fulfillmentProvider: null,
        trackingUrl: null,
        variantOptions: null,
      },
    ],
    storeShippings: [],
  } as OrderDetail;
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    mockUseOrderPendingReviews.mockReturnValue({
      pendingReviewItems: [],
      hasPendingReviews: false,
      loading: false,
    });
  });

  it('renders pending_payment status label', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('pending_payment'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
    });
  });

  it('renders pay now link when order is pending_payment', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('pending_payment'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'ชำระเงิน' })).toHaveAttribute(
        'href',
        '/payment/order-1',
      );
      expect(screen.queryByRole('link', { name: 'ขอคืนสินค้า' })).not.toBeInTheDocument();
    });
  });

  it('renders pay now link for legacy pending status', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('pending'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'ชำระเงิน' })).toHaveAttribute(
        'href',
        '/payment/order-1',
      );
    });
  });

  it('renders legacy pending status label', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('pending'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
    });
  });

  it('does not render return link for paid orders', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('paid'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'ขอคืนสินค้า' })).not.toBeInTheDocument();
    });
  });

  it('hides return link for shipped orders until delivery is confirmed', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('shipped'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ยืนยันได้รับสินค้าแล้ว' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'ขอคืนสินค้า' })).not.toBeInTheDocument();
    });
  });

  it('does not render return link for delivered orders', async () => {
    mockUseOrderDetail.mockReturnValue({
      order: {
        ...createOrder('delivered'),
        items: [
          {
            ...createOrder('delivered').items[0],
            fulfillmentStatus: 'delivered',
          },
        ],
      },
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'ขอคืนสินค้า' })).not.toBeInTheDocument();
    });
  });

  it('renders review CTA link when order is delivered and reviews are pending', async () => {
    mockUseOrderPendingReviews.mockReturnValue({
      pendingReviewItems: [{ orderId: 'order-1' }],
      hasPendingReviews: true,
      loading: false,
    });
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('delivered'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'กลับไปรายการคำสั่งซื้อ' })).toHaveAttribute(
        'href',
        '/user/orders',
      );
      expect(screen.getByRole('link', { name: 'เขียนรีวิว' })).toHaveAttribute(
        'href',
        '/user/reviews?orderId=order-1',
      );
      expect(screen.queryByRole('link', { name: 'ขอคืนสินค้า' })).not.toBeInTheDocument();
    });
  });

  it('disables review CTA when all products from the order are already reviewed', async () => {
    mockUseOrderPendingReviews.mockReturnValue({
      pendingReviewItems: [],
      hasPendingReviews: false,
      loading: false,
    });
    mockUseOrderDetail.mockReturnValue({
      order: createOrder('delivered'),
      loading: false,
      error: undefined,
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    });

    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'เขียนรีวิวแล้ว' })).toBeDisabled();
      expect(screen.queryByRole('link', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
    });
  });
});
