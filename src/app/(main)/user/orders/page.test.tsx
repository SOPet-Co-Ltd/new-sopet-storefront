import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UserOrdersPage from './page';

vi.mock('@/lib/hooks/useOrders', () => ({
  useOrders: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/orders',
}));

import { useOrders } from '@/lib/hooks/useOrders';

const mockedUseOrders = vi.mocked(useOrders);

describe('UserOrdersPage', () => {
  it('renders AccountEmptyState when orders list is empty', () => {
    mockedUseOrders.mockReturnValue({
      orders: [],
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
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
          items: [{ quantity: 1 }],
        },
      ],
      loading: false,
      fetchOrder: vi.fn(),
      confirmOrderDelivered: vi.fn(),
      confirmingDelivery: false,
    } as ReturnType<typeof useOrders>);

    render(<UserOrdersPage />);

    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
  });
});
