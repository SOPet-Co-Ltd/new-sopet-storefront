import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderConfirmationSummary } from './OrderConfirmationSummary';
import type { OrderQuery } from '@/lib/graphql/generated/graphql';

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
});
