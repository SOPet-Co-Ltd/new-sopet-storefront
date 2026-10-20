import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductFloatingBuyCard } from './ProductFloatingBuyCard';
import { trackAddToCart } from '@/lib/analytics';
import { setBuyNowCheckout } from '@/lib/checkout/buyNowCheckout';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { CartProvider } from '@/lib/providers/CartProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/analytics', () => ({
  trackAddToCart: vi.fn(),
}));

vi.mock('@/lib/checkout/buyNowCheckout', () => ({
  buildBuyNowCheckoutPayload: vi.fn((args) => ({
    product: args.product,
    variantId: args.variantId,
    quantity: args.quantity,
    price: args.price,
    compareAtPrice: args.compareAtPrice,
  })),
  setBuyNowCheckout: vi.fn(),
}));

vi.mock('@/lib/cart/flyToCart', () => ({
  flyToCart: vi.fn(),
  getProductFlyImageUrl: vi.fn(() => 'https://example.com/thumb.jpg'),
}));

const mockAddItem = vi.fn();
vi.mock('@/lib/providers/CartProvider', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

const SAMPLE_PRODUCT: ProductDetail = {
  __typename: 'ProductType',
  id: 'prod-123',
  name: 'Bravecto บราเวคโต แบบเม็ด สุนัข 20-40 kg',
  slug: 'bravecto-20-40kg',
  storeId: 'store-1',
  basePrice: 799,
  compareAtPrice: 885,
  thumbnailUrl: 'https://example.com/bravecto.jpg',
  averageRating: 5.0,
  reviewCount: 2500,
  soldCount: 1000,
  description: 'Test description',
  status: 'published',
  category: 'dog-medicine',
  brandName: 'Bravecto',
  tags: ['dog'],
  warning: null,
  expiryDate: '12/12/2028',
  store: {
    __typename: 'StoreType',
    id: 'store-1',
    name: 'Sopet Shop',
    slug: 'sopet-shop',
    logoUrl: null,
    bannerUrl: null,
    description: 'Sopet Shop',
  },
  images: [
    {
      id: 'img-1',
      imageUrl: 'https://example.com/bravecto.jpg',
      isThumbnail: true,
      sortOrder: 0,
    },
  ],
  variants: [
    {
      id: 'var-1',
      sku: 'BV-20-40',
      price: 799,
      compareAtPrice: 885,
      stockQuantity: 16,
      optionsJson: JSON.stringify({ size: '20-40 kg' }),
    },
    {
      id: 'var-2',
      sku: 'BV-40-56',
      price: 899,
      compareAtPrice: 999,
      stockQuantity: 0,
      optionsJson: JSON.stringify({ size: '40-56 kg' }),
    },
  ],
};

function renderComponent(props: Partial<React.ComponentProps<typeof ProductFloatingBuyCard>> = {}) {
  const ApolloWrapper = createApolloTestWrapper();
  return render(
    <ApolloWrapper>
      <CartProvider>
        <ProductFloatingBuyCard
          product={SAMPLE_PRODUCT}
          selectedOptions={{ size: '20-40 kg' }}
          productQuantity={1}
          forceVisible={true}
          {...props}
        />
      </CartProvider>
    </ApolloWrapper>,
  );
}

describe('ProductFloatingBuyCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders thumbnail image, formatted price, compare-at price, and savings badge', () => {
    renderComponent();

    expect(screen.getByTestId('product-floating-buy-card')).toBeInTheDocument();
    expect(screen.getByTestId('floating-variant-price')).toHaveTextContent('฿799.00');
    expect(screen.getByTestId('floating-compare-price')).toHaveTextContent('฿885.00');
    expect(screen.getByTestId('floating-saved-badge')).toHaveTextContent('ประหยัด ฿86');
    expect(screen.getByRole('button', { name: /เพิ่ม.*ลงตะกร้า/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ซื้อ.*เลย/ })).toBeInTheDocument();
  });

  it('triggers addItem and analytics on Add to Cart click', async () => {
    const user = userEvent.setup();
    renderComponent({ productQuantity: 2 });

    const addToCartButton = screen.getByRole('button', { name: /เพิ่ม.*ลงตะกร้า/ });
    await user.click(addToCartButton);

    expect(mockAddItem).toHaveBeenCalledWith('var-1', 2);
    expect(trackAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 799 * 2,
        items: [
          expect.objectContaining({
            item_id: 'prod-123',
            item_variant: 'var-1',
            quantity: 2,
            price: 799,
          }),
        ],
      }),
    );
  });

  it('triggers setBuyNowCheckout and router push on Buy Now click', async () => {
    const user = userEvent.setup();
    renderComponent({ productQuantity: 1 });

    const buyNowButton = screen.getByRole('button', { name: /ซื้อ.*เลย/ });
    await user.click(buyNowButton);

    expect(setBuyNowCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        product: SAMPLE_PRODUCT,
        variantId: 'var-1',
        quantity: 1,
        price: 799,
        compareAtPrice: 885,
      }),
    );
    expect(pushMock).toHaveBeenCalledWith('/checkout?mode=buy-now');
  });

  it('disables buttons when variant is out of stock', () => {
    renderComponent({
      selectedOptions: { size: '40-56 kg' },
    });

    expect(screen.getByTestId('floating-variant-price')).toHaveTextContent('฿899.00');
    const addToCartButton = screen.getByRole('button', { name: 'สินค้าหมด' });
    expect(addToCartButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'สินค้าหมด ไม่สามารถสั่งซื้อได้' })).toBeDisabled();
  });

  it('handles fade in via opacity and pointer-events classes based on visibility', () => {
    const { rerender } = renderComponent({ forceVisible: false });

    expect(screen.getByTestId('product-floating-buy-card')).toHaveClass(
      'opacity-0',
      'pointer-events-none',
    );

    const ApolloWrapper = createApolloTestWrapper();
    rerender(
      <ApolloWrapper>
        <CartProvider>
          <ProductFloatingBuyCard
            product={SAMPLE_PRODUCT}
            selectedOptions={{ size: '20-40 kg' }}
            forceVisible={true}
          />
        </CartProvider>
      </ApolloWrapper>,
    );

    expect(screen.getByTestId('product-floating-buy-card')).toHaveClass(
      'opacity-100',
      'pointer-events-auto',
    );
  });

  it('notifies parent when visibility changes via onVisibilityChange', async () => {
    const onVisibilityChange = vi.fn();
    const { rerender } = renderComponent({
      forceVisible: false,
      onVisibilityChange,
    });

    await waitFor(() => {
      expect(onVisibilityChange).toHaveBeenCalledWith(false);
    });

    const ApolloWrapper = createApolloTestWrapper();
    rerender(
      <ApolloWrapper>
        <CartProvider>
          <ProductFloatingBuyCard
            product={SAMPLE_PRODUCT}
            selectedOptions={{ size: '20-40 kg' }}
            forceVisible={true}
            onVisibilityChange={onVisibilityChange}
          />
        </CartProvider>
      </ApolloWrapper>,
    );

    await waitFor(() => {
      expect(onVisibilityChange).toHaveBeenCalledWith(true);
    });
  });
});
