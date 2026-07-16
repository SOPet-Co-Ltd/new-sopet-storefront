import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutOrderLineFreeUnitIndicator } from '@/components/sections/CheckoutSection/CheckoutOrderLineFreeUnitIndicator';
import { CheckoutOrderItemRow } from '@/components/sections/CheckoutSection/CheckoutOrderItemRow';
import { allocateServerFreeUnitsToLines } from '@/components/sections/CheckoutSection/allocateServerFreeUnits';
import type { CartItem } from '@/lib/cart/cartUtils';
import { BXGY_PRODUCT_ID } from '@/test/mocks/fixtures/promotion-universal-conditions';
import { CHECKOUT_STORE_ID } from '@/test/mocks/fixtures/checkout';

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    return <img alt={props.alt ?? ''} />;
  },
}));

function makeCartItem(overrides: {
  id: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
  variantId?: string;
}): CartItem {
  return {
    id: overrides.id,
    quantity: overrides.quantity,
    variantId: overrides.variantId ?? `var-${overrides.id}`,
    productVariant: {
      id: overrides.variantId ?? `var-${overrides.id}`,
      price: overrides.unitPrice,
      optionsJson: null,
      product: {
        id: overrides.productId ?? BXGY_PRODUCT_ID,
        name: 'BxGy Product',
        thumbnailUrl: null,
        storeId: CHECKOUT_STORE_ID,
        store: { id: CHECKOUT_STORE_ID, name: 'ร้านทดสอบ', slug: 'test' },
      },
    },
  } as CartItem;
}

describe('CheckoutOrderLineFreeUnitIndicator', () => {
  it('hides when freeQuantity is 0', () => {
    const { container } = render(<CheckoutOrderLineFreeUnitIndicator freeQuantity={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows แถมฟรี text for a single free unit (not color-only)', () => {
    render(<CheckoutOrderLineFreeUnitIndicator freeQuantity={1} />);
    expect(screen.getByTestId('checkout-order-line-free-unit-indicator')).toHaveTextContent(
      'แถมฟรี',
    );
  });

  it('shows รวมแถมฟรี {n} ชิ้น when freeQuantity > 1', () => {
    render(<CheckoutOrderLineFreeUnitIndicator freeQuantity={2} />);
    expect(screen.getByTestId('checkout-order-line-free-unit-indicator')).toHaveTextContent(
      'รวมแถมฟรี 2 ชิ้น',
    );
  });
});

describe('allocateServerFreeUnitsToLines (Gate A)', () => {
  it('attributes cheapest units from server freeUnits only', () => {
    const items = [
      makeCartItem({ id: 'line-a', quantity: 2, unitPrice: 300, variantId: 'a' }),
      makeCartItem({ id: 'line-b', quantity: 1, unitPrice: 200, variantId: 'b' }),
    ];

    const alloc = allocateServerFreeUnitsToLines(1, items, BXGY_PRODUCT_ID);
    expect(alloc['line-b']).toBe(1);
    expect(alloc['line-a']).toBeUndefined();
  });

  it('returns empty when freeUnits is 0 (Gate A negative — estimate alone must not badge)', () => {
    const items = [makeCartItem({ id: 'line-a', quantity: 3, unitPrice: 100 })];
    expect(allocateServerFreeUnitsToLines(0, items, BXGY_PRODUCT_ID)).toEqual({});
  });

  it('returns empty when productId missing even if freeUnits > 0', () => {
    const items = [makeCartItem({ id: 'line-a', quantity: 3, unitPrice: 100 })];
    expect(allocateServerFreeUnitsToLines(1, items, null)).toEqual({});
  });
});

describe('CheckoutOrderItemRow free-unit badge wiring', () => {
  it('renders indicator when freeQuantity from server alloc > 0', () => {
    const item = makeCartItem({ id: 'line-1', quantity: 2, unitPrice: 200 });
    render(<CheckoutOrderItemRow item={item} freeQuantity={1} />);
    expect(screen.getByTestId('checkout-order-line-free-unit-indicator')).toHaveTextContent(
      'แถมฟรี',
    );
  });

  it('does not render indicator when freeQuantity is 0 (promo removed / estimate-only)', () => {
    const item = makeCartItem({ id: 'line-1', quantity: 3, unitPrice: 200 });
    render(<CheckoutOrderItemRow item={item} freeQuantity={0} />);
    expect(screen.queryByTestId('checkout-order-line-free-unit-indicator')).not.toBeInTheDocument();
  });
});
