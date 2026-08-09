import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductCard, {
  getProductCardCheapestVariantId,
  getProductCardCompareAtPrice,
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

describe('getProductCardCheapestVariantId', () => {
  it('returns the id of the lowest positive-priced variant', () => {
    expect(
      getProductCardCheapestVariantId({
        variants: [
          { id: 'v1', price: 250 },
          { id: 'v2', price: 180 },
        ],
      }),
    ).toBe('v2');
  });

  it('returns null when there are no positive-priced variants', () => {
    expect(getProductCardCheapestVariantId({ variants: [{ id: 'v1', price: 0 }] })).toBeNull();
  });
});

describe('getProductCardCompareAtPrice', () => {
  it('prefers the resolved campaign compare-at over static prices', () => {
    expect(
      getProductCardCompareAtPrice(
        { compareAtPrice: 300, variants: [{ price: 100, compareAtPrice: 200 }] },
        150,
      ),
    ).toBe(150);
  });

  it('falls back to the cheapest variant compareAtPrice when no campaign value is given', () => {
    expect(
      getProductCardCompareAtPrice({
        compareAtPrice: 300,
        variants: [
          { id: 'v1', price: 100, compareAtPrice: 200 },
          { id: 'v2', price: 50, compareAtPrice: 90 },
        ],
      }),
    ).toBe(90);
  });

  it('falls back to the product-level compareAtPrice when no variants have one', () => {
    expect(
      getProductCardCompareAtPrice({
        compareAtPrice: 300,
        variants: [{ price: 100, compareAtPrice: null }],
      }),
    ).toBe(300);
  });
});

describe('ProductCard', () => {
  it('shows campaign sale unit and honest compare-at when provided', () => {
    render(
      <ProductCard
        product={buildProduct({
          name: 'sale item',
          basePrice: 279,
          variants: [{ id: 'v1', price: 279, compareAtPrice: null }],
        })}
        campaignSalePrice={223.2}
        campaignCompareAt={279}
        compact
      />,
    );

    expect(screen.getByText('฿223.20')).toBeInTheDocument();
    expect(screen.getByText('฿279.00')).toBeInTheDocument();
  });

  it('shows the lowest variant price instead of the out-of-area message', () => {
    render(
      <ProductCard
        product={buildProduct({
          name: 'test',
          basePrice: 0,
          variants: [
            { id: 'v1', price: 299, compareAtPrice: null },
            { id: 'v2', price: 199, compareAtPrice: null },
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
          variants: [{ id: 'v1', price: 0, compareAtPrice: null }],
        })}
        compact
      />,
    );

    expect(screen.getByText('ไม่มีสินค้าในพื้นที่ของคุณ')).toBeInTheDocument();
  });
});
