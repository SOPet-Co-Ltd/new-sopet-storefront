import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ORDER_STATUS_LABELS } from '@/lib/constants/orderStatus';
import { OrderTrackingStatusHeader } from './order-tracking-status-header';

describe('OrderTrackingStatusHeader', () => {
  it('renders order number, Thai status badge, and formatted date in status region', () => {
    render(
      <OrderTrackingStatusHeader
        orderNumber="ORD-001"
        status="paid"
        createdAt="2024-06-15T10:30:00.000Z"
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText(ORDER_STATUS_LABELS.paid)).toBeInTheDocument();
    expect(screen.getByTestId('account-status-badge')).toBeInTheDocument();
    expect(screen.getByText('ติดตามคำสั่งซื้อ')).toHaveClass('sr-only');
  });
});
