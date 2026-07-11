import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { HomeProductSection } from '@/components/sections/HomeProductSection';
import { ProductListing } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

// AC-006: Home view-all hover-prefetch journey
// Behavior: hover view-all -> scoped Products prefetch -> PLP renders without skeleton when hydrated.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (HomeProductSection, prefetchProductsListing, ProductListing), mocked GraphQL transport

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
  usePathname: () => '/search',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

describe('View-all to search prefetch journey', () => {
  it('prefetches the all-products listing when view-all is hovered', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<HomeProductSection heading="สินค้าแนะนำ" />, { wrapper: createWrapper() });
    await screen.findByText('Premium Dog Food 5kg');

    const countAfterSectionLoad = productsCallCount;
    const viewAllLink = screen.getByRole('link', { name: /ดูทั้งหมด/ });
    fireEvent.mouseEnter(viewAllLink);
    fireEvent.focus(viewAllLink);

    await waitFor(() => {
      expect(productsCallCount).toBe(countAfterSectionLoad + 1);
    });
  });

  it('renders the categories PLP without skeleton when initial products are provided', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          },
        }),
      ),
    );

    render(<ProductListing initialProducts={[SAMPLE_PRODUCT]} limit={10} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();
  });
});
