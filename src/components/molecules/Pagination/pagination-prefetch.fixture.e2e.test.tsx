import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductListing } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

// AC-006: Pagination hover-prefetch de-duplicates and warms cache before page change.
// Behavior: hover next page -> one scoped Products query -> click -> no skeleton, no second call.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (Pagination, prefetchProductsListing, ProductListing), mocked GraphQL transport

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';

const SAMPLE_PRODUCT = {
  __typename: 'ProductType' as const,
  id: 'prod-001',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg',
  storeId: STORE_ID,
  basePrice: 890,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/dog-food.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  store: {
    __typename: 'StoreType' as const,
    id: STORE_ID,
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

const push = vi.fn();
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/categories/dog-food',
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

beforeEach(() => {
  searchParams = new URLSearchParams();
  push.mockClear();
});

describe('Pagination hover-prefetch journey', () => {
  it('prefetches next page once and renders without skeleton after click', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;
        const page = (variables.page as number) ?? 1;
        return HttpResponse.json({
          data: {
            products: {
              items:
                page === 1
                  ? [SAMPLE_PRODUCT]
                  : [{ ...SAMPLE_PRODUCT, id: 'prod-002', name: 'Cat Litter 10L' }],
              pagination: { page, limit: 24, total: 30, totalPages: 2 },
            },
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(<ProductListing category="dog-food" />, { wrapper: createWrapper() });

    await screen.findByText('Premium Dog Food 5kg');

    const nextButton = screen.getAllByRole('button', { name: 'หน้าถัดไป' })[0];
    const classNameBefore = nextButton.className;
    const styleBefore = nextButton.getAttribute('style');

    fireEvent.mouseEnter(nextButton);
    fireEvent.focus(nextButton);

    await waitFor(() => {
      expect(productsCallCount).toBe(2);
    });

    expect(nextButton.className).toBe(classNameBefore);
    expect(nextButton.getAttribute('style')).toBe(styleBefore);

    fireEvent.mouseEnter(nextButton);
    expect(productsCallCount).toBe(2);

    await user.click(nextButton);
    expect(push).toHaveBeenCalledWith('/categories/dog-food?page=2');
    expect(productsCallCount).toBe(2);
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();
  });

  it('does not prefetch when next page control is disabled', async () => {
    let productsCallCount = 0;
    searchParams = new URLSearchParams('page=2');

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;
        const page = (variables.page as number) ?? 1;
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page, limit: 24, total: 30, totalPages: 2 },
            },
          },
        });
      }),
    );

    render(<ProductListing category="dog-food" />, { wrapper: createWrapper() });
    await screen.findByText('Premium Dog Food 5kg');

    const countAfterRender = productsCallCount;
    const nextButton = screen.getAllByRole('button', { name: 'หน้าถัดไป' })[0];
    fireEvent.mouseEnter(nextButton);

    expect(productsCallCount).toBe(countAfterRender);
  });
});
