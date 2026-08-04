import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductCard, {
  getProductCardDisplayPrice,
  type ProductCardProduct,
} from '@/components/organisms/ProductCard';

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    return <img alt={props.alt} />;
  },
}));

vi.mock('@/lib/catalog/prefetchProduct', () => ({
  prefetchProductById: vi.fn(),
}));

function buildProduct(overrides: Partial<ProductCardProduct> = {}): ProductCardProduct {
  return {
    id: 'prod-1',
    name: 'test',
    slug: 'test',
    basePrice: 0,
    compareAtPrice: null,
    thumbnailUrl: null,
    averageRating: 0,
    reviewCount: 0,
    soldCount: 0,
    variants: [],
    ...overrides,
  };
}

describe('getProductCardDisplayPrice', () => {
  it('returns the lowest positive variant price when basePrice is 0', () => {
    expect(
      getProductCardDisplayPrice({
        basePrice: 0,
        variants: [{ price: 250 }, { price: 180 }, { price: 320 }],
      }),
    ).toBe(180);
  });

  it('falls back to basePrice when there are no variants', () => {
    expect(getProductCardDisplayPrice({ basePrice: 890, variants: [] })).toBe(890);
  });

  it('ignores zero or missing variant prices', () => {
    expect(
      getProductCardDisplayPrice({
        basePrice: 50,
        variants: [{ price: 0 }, { price: 120 }, null],
      }),
    ).toBe(120);
  });
});

describe('ProductCard', () => {
  it('shows the lowest variant price instead of the out-of-area message', () => {
    render(
      <ProductCard
        product={buildProduct({
          name: 'test',
          basePrice: 0,
          variants: [
            { id: 'v1', price: 299 },
            { id: 'v2', price: 199 },
          ],
        })}
        compact
      />,
    );

    expect(screen.getByText('฿199.00')).toBeInTheDocument();
    expect(screen.queryByText('ไม่มีสินค้าในพื้นที่ของคุณ')).not.toBeInTheDocument();
  });

  it('shows the out-of-area message when no sellable price exists', () => {
    render(
      <ProductCard
        product={buildProduct({
          basePrice: 0,
          variants: [{ id: 'v1', price: 0 }],
        })}
        compact
      />,
    );

    expect(screen.getByText('ไม่มีสินค้าในพื้นที่ของคุณ')).toBeInTheDocument();
  });
});
