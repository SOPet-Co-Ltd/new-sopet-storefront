import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderConfirmationSummary } from './OrderConfirmationSummary';
import type { OrderQuery } from '@/lib/graphql/generated/graphql';
import { sampleOrderTracking } from '@/test/mocks/fixtures/order-tracking';

type Order = NonNullable<OrderQuery['order']>;

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status: 'delivered',
    createdAt: '2025-01-01T00:00:00.000Z',
    subtotal: 250,
    shippingFee: 50,
    discountAmount: 0,
    total: 300,
    paymentMethod: 'promptpay',
    items: [
      {
        id: 'item-1',
        variantId: 'variant-1',
        storeId: 'store-1',
        productName: 'Pet Shampoo 500ml',
        productId: 'prod-1',
        productImageUrl: 'https://example.com/shampoo.jpg',
        unitPrice: 250,
        quantity: 1,
        subtotal: 250,
        fulfillmentStatus: 'delivered',
        trackingNumber: null,
        fulfillmentProvider: null,
        trackingUrl: null,
        variantOptions: null,
      },
    ],
    storeShippings: [
      {
        storeId: 'store-1',
        optionName: 'Standard Delivery',
        shippingFee: 50,
      },
    ],
    ...overrides,
  };
}

describe('OrderConfirmationSummary', () => {
  it('renders product thumbnail and links each item to the product page', () => {
    render(<OrderConfirmationSummary order={createOrder()} />);

    expect(screen.getByTestId('product-thumbnail-image')).toHaveAttribute(
      'src',
      'https://example.com/shampoo.jpg',
    );
    expect(screen.getByRole('link', { name: /Pet Shampoo 500ml/ })).toHaveAttribute(
      'href',
      '/product/prod-1',
    );
  });

  it('renders multiple line items that share the same productId', () => {
    const baseItem = createOrder().items[0];
    render(
      <OrderConfirmationSummary
        order={createOrder({
          items: [
            { ...baseItem, id: 'item-1', variantOptions: '{"ขนาด":"1kg"}' },
            {
              ...baseItem,
              id: 'item-2',
              variantOptions: '{"ขนาด":"3kg"}',
              unitPrice: 400,
              subtotal: 400,
            },
          ],
          subtotal: 650,
          total: 700,
        })}
      />,
    );

    expect(screen.getAllByTestId('order-confirmation-item')).toHaveLength(2);
    expect(screen.getAllByTestId('order-item-variant-options')).toHaveLength(2);
  });

  it('renders items without links when productId is missing', () => {
    render(
      <OrderConfirmationSummary
        order={createOrder({
          items: [
            {
              ...createOrder().items[0],
              productId: null,
              productImageUrl: null,
            },
          ],
        })}
      />,
    );

    expect(screen.queryByRole('link', { name: /Pet Shampoo 500ml/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('product-thumbnail-fallback')).toBeInTheDocument();
  });

  it('renders authenticated order with header by default', () => {
    render(<OrderConfirmationSummary order={createOrder()} />);

    expect(screen.getByRole('heading', { name: 'รายละเอียดคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByText(/ORD-001/)).toBeInTheDocument();
    expect(screen.getByTestId('order-confirmation-total')).toHaveTextContent('฿300');
  });

  it('renders tracking fixture with hideHeader and omits duplicate header', () => {
    render(<OrderConfirmationSummary order={sampleOrderTracking} hideHeader />);

    expect(screen.queryByRole('heading', { name: 'รายละเอียดคำสั่งซื้อ' })).not.toBeInTheDocument();
    expect(screen.queryByText(/เลขที่คำสั่งซื้อ/)).not.toBeInTheDocument();
    expect(screen.queryByText(/วันที่สั่งซื้อ/)).not.toBeInTheDocument();
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByText('จัดส่งมาตรฐาน')).toBeInTheDocument();
    expect(screen.getByTestId('order-confirmation-total')).toHaveTextContent('฿540');
  });

  it('renders snapshot variantOptions under product name when present (AC-014)', () => {
    render(
      <OrderConfirmationSummary
        order={createOrder({
          items: [
            {
              ...createOrder().items[0],
              variantOptions: '{"รสชาติ":"ปลาแซลมอน","ขนาด":"1.5kg"}',
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId('order-item-variant-options')).toHaveTextContent(
      'ขนาด: 1.5kg · รสชาติ: ปลาแซลมอน',
    );
  });

  it('omits the options line when variantOptions is null or empty', () => {
    const { rerender } = render(
      <OrderConfirmationSummary
        order={createOrder({
          items: [{ ...createOrder().items[0], variantOptions: null }],
        })}
      />,
    );
    expect(screen.queryByTestId('order-item-variant-options')).not.toBeInTheDocument();

    rerender(
      <OrderConfirmationSummary
        order={createOrder({
          items: [{ ...createOrder().items[0], variantOptions: '{}' }],
        })}
      />,
    );
    expect(screen.queryByTestId('order-item-variant-options')).not.toBeInTheDocument();
  });
});
