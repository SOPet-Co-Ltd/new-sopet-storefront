import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { ProductListing } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

// AC-006: Home CategoryCard hover-prefetch journey
// Behavior: hover category card -> scoped Products prefetch -> PLP renders without skeleton when hydrated.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (CategoryCard, prefetchProductsListing, ProductListing), mocked GraphQL transport

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
  id: 'prod-001',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg',
  storeId: 'store-1',
  basePrice: 890,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/dog-food.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  store: {
    __typename: 'StoreType' as const,
    id: 'store-1',
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/categories/dog-food',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

describe('Home to category prefetch journey', () => {
  it('prefetches the scoped category listing when a category card is hovered', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;
        expect(variables).toMatchObject({ category: 'dog-food', page: 1 });
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<HomeCategories initialCategories={SAMPLE_CATEGORIES} />, {
      wrapper: createWrapper(),
    });

    const categoryLink = screen.getByRole('link', { name: 'ดูหมวดหมู่ อาหารสุนัข' });
    fireEvent.mouseEnter(categoryLink);
    fireEvent.focus(categoryLink);

    await waitFor(() => {
      expect(productsCallCount).toBe(1);
    });

    fireEvent.mouseEnter(categoryLink);
    expect(productsCallCount).toBe(1);
  });

  it('renders the category PLP without skeleton when initial products are provided', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        }),
      ),
    );

    render(<ProductListing category="dog-food" initialProducts={[SAMPLE_PRODUCT]} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();
  });
});
