import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { HomeRecommendedProductSection } from '@/components/sections/HomeRecommendedProductSection';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const SAMPLE_CATEGORIES = [
  {
    __typename: 'CategoryType' as const,
    id: 'cat-1',
    name: 'อาหารสุนัข',
    slug: 'dog-food',
    imageUrl: 'https://example.com/dog-food-category.jpg',
  },
];

const SAMPLE_PRODUCT = {
  __typename: 'ProductType' as const,
  id: 'prod-1',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food',
  storeId: 'store-1',
  basePrice: 599,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/product.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 40,
  variants: null,
};

describe('Home SSR reconciliation', () => {
  it('renders categories from initialCategories without skeleton', () => {
    render(<HomeCategories initialCategories={SAMPLE_CATEGORIES} />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByText('อาหารสุนัข')).toBeInTheDocument();
    expect(
      screen
        .queryByText('หมวดหมู่สินค้า')
        ?.closest('section')
        ?.querySelector('[aria-hidden="true"]'),
    ).toBeNull();
  });

  it('renders recommended products from initialRecommendedProducts without skeleton', () => {
    render(<HomeRecommendedProductSection initialRecommendedProducts={[SAMPLE_PRODUCT]} />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(
      screen.queryByText('สินค้าแนะนำ')?.closest('section')?.querySelector('.animate-pulse'),
    ).toBeNull();
  });
});
