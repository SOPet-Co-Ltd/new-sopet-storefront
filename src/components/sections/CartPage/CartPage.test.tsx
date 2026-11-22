import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartPage from './CartPage';
import { sampleCart } from '@/test/mocks/fixtures/cart';
import { groupCartItemsByStore } from '@/lib/cart/cartUtils';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/sections/CartPage/CartRecommendedProductSection', () => ({
  CartRecommendedProductSection: () => null,
}));

vi.mock('@/lib/providers/CartProvider', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '@/lib/providers/CartProvider';

const mockedUseCart = vi.mocked(useCart);

describe('CartPage', () => {
  beforeEach(() => {
    const items = sampleCart.items;
    mockedUseCart.mockReturnValue({
      cart: sampleCart,
      items,
      itemsByStore: groupCartItemsByStore(items),
      itemCount: 2,
      subtotal: 1780,
      selectedItems: items,
      selectedItemsByStore: groupCartItemsByStore(items),
      selectedItemCount: 2,
      selectedSubtotal: 1780,
      allItemsSelected: true,
      isItemSelected: () => true,
      isStoreSelected: () => true,
      toggleItemSelected: vi.fn(),
      setStoreSelected: vi.fn(),
      setAllSelected: vi.fn(),
      loading: false,
      error: undefined,
      warnings: [],
      hasSuspendedStoreItemRemovedWarning: false,
      addItem: vi.fn(async () => undefined),
      updateItem: vi.fn(async () => undefined),
      changeItemVariant: vi.fn(async () => undefined),
      removeItem: vi.fn(async () => undefined),
      pruneDeselectedIds: vi.fn(),
      refetch: vi.fn(async () => undefined),
    });
  });

  it('formats cart subtotal with two decimal places', () => {
    render(<CartPage />);

    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('฿1,780.00');
  });

  it('formats line unit price with two decimal places', () => {
    render(<CartPage />);

    expect(screen.getByText('฿890.00')).toBeInTheDocument();
  });
});
