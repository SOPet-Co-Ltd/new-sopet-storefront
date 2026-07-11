import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { OrderTrackingQuery } from '@/lib/graphql/generated/graphql';
import { ORDER_STATUS_LABELS } from '@/lib/constants/orderStatus';
import { OrderTrackingPageContent } from './order-tracking-page-content';

const mockOrderData: OrderTrackingQuery['orderTracking'] = {
  orderNumber: 'ORD-001',
  status: 'paid',
  createdAt: '2024-06-15T10:30:00.000Z',
  subtotal: 1000,
  shippingFee: 50,
  discountAmount: 0,
  total: 1050,
  items: [
    {
      storeId: 'store-1',
      productId: 'prod-1',
      productName: 'Dog Food',
      productImageUrl: null,
      quantity: 1,
      unitPrice: 1000,
      subtotal: 1000,
      fulfillmentStatus: 'shipped',
      trackingNumber: 'TH123',
      fulfillmentProvider: 'kerry',
      trackingUrl: 'https://track.example.com/TH123',
    },
  ],
  storeShippings: [{ storeId: 'store-1', optionName: 'Standard', shippingFee: 50 }],
};

describe('OrderTrackingPageContent', () => {
  it('renders loading state when queryState is loading', () => {
    render(
      <OrderTrackingPageContent
        orderNumber="ORD-001"
        queryState={{ status: 'loading' }}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByTestId('order-tracking-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('order-tracking-not-found')).not.toBeInTheDocument();
    expect(screen.queryByTestId('order-tracking-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('order-tracking-success')).not.toBeInTheDocument();
  });

  it('renders not-found state for not-found queryState only', () => {
    render(
      <OrderTrackingPageContent
        orderNumber="garbage"
        queryState={{ status: 'not-found' }}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'ไม่พบคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ลองอีกครั้ง' })).not.toBeInTheDocument();
  });

  it('renders error state and wires refetch to retry', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    render(
      <OrderTrackingPageContent
        orderNumber="ORD-001"
        queryState={{ status: 'error', error: new Error('network') }}
        refetch={refetch}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
  });

  it('assembles success stack with status header, shipment list, and summary', () => {
    render(
      <OrderTrackingPageContent
        orderNumber="ORD-001"
        queryState={{ status: 'success', data: mockOrderData }}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByTestId('order-tracking-success')).toBeInTheDocument();
    expect(screen.getByTestId('order-tracking-status-header')).toBeInTheDocument();
    expect(screen.getByText(ORDER_STATUS_LABELS.paid)).toBeInTheDocument();
    expect(screen.getByText('ติดตามพัสดุ')).toBeInTheDocument();
    expect(screen.getByText('Dog Food')).toBeInTheDocument();
    expect(screen.queryByText('คำสั่งซื้อ #ORD-001')).not.toBeInTheDocument();
  });
});
