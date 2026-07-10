import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import UserOrdersPage from './page';

const mockPush = vi.fn();

vi.mock('@/lib/hooks/useOrders', () => ({
  useOrders: vi.fn(),
}));

vi.mock('@/lib/hooks/useOrdersReviewStatus', () => ({
  useOrdersReviewStatus: vi.fn(() => ({
    isOrderFullyReviewed: () => false,
    loading: false,
  })),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/orders',
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

import { useOrders } from '@/lib/hooks/useOrders';

const mockedUseOrders = vi.mocked(useOrders);

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
};

describe('UserOrdersPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('renders AccountEmptyState when orders list is empty', () => {
    mockedUseOrders.mockReturnValue({
      orders: [],
      pagination: { ...defaultPagination, total: 0 },
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useOrders>);

    render(<UserOrdersPage />);

    expect(screen.getByTestId('account-empty-state')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีคำสั่งซื้อ')).toBeInTheDocument();
  });

  it('renders pending_payment status label via ORDER_STATUS_LABELS', () => {
    mockedUseOrders.mockReturnValue({
      orders: [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'pending_payment',
          createdAt: '2025-01-01T00:00:00.000Z',
          total: 1000,
          items: [{ id: 'item-1', productName: 'Premium Dog Food 5kg', quantity: 1 }],
        },
      ],
      pagination: defaultPagination,
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useOrders>);

    render(<UserOrdersPage />);

    expect(screen.getByTestId('account-status-badge')).toHaveTextContent('รอชำระเงิน');
  });

  it('shows pagination when totalPages is greater than one', () => {
    mockedUseOrders.mockReturnValue({
      orders: [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'paid',
          createdAt: '2025-01-01T00:00:00.000Z',
          total: 1000,
          items: [{ id: 'item-1', productName: 'Premium Dog Food 5kg', quantity: 1 }],
        },
      ],
      pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useOrders>);

    render(<UserOrdersPage />);

    expect(screen.getByLabelText('การแบ่งหน้า')).toBeInTheDocument();
    expect(screen.getByText('หน้า 1', { exact: false })).toBeInTheDocument();
  });

  it('updates filter in URL and resets page when a tab is selected', async () => {
    mockedUseOrders.mockReturnValue({
      orders: [],
      pagination: { page: 2, limit: 10, total: 0, totalPages: 1 },
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useOrders>);

    render(<UserOrdersPage />);

    await userEvent.click(screen.getByRole('tab', { name: 'รอชำระเงิน' }));

    expect(mockPush).toHaveBeenCalledWith('/user/orders?filter=PENDING_PAYMENT');
  });
});
