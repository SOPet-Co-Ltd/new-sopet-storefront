import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellerTabs } from '@/components/organisms/SellerTabs/SellerTabs';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

// AC-006: SellerTabs hover-prefetch scoped to seller products tab.
// Behavior: hover products tab from reviews -> one scoped Products query -> tab content without extra call.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (SellerTabs, prefetchProductsListing), mocked GraphQL transport

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
const STORE_SLUG = 'sopet-pet-shop';

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
    slug: STORE_SLUG,
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => `/sellers/${STORE_SLUG}/reviews`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

beforeEach(() => {
  server.use(
    graphql.query('Products', ({ variables }) => {
      expect(variables).toMatchObject({ storeId: STORE_ID, page: 1, limit: 24 });
      return HttpResponse.json({
        data: {
          products: {
            items: [SAMPLE_PRODUCT],
            pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
          },
        },
      });
    }),
    graphql.query('StoreReviewSummary', () =>
      HttpResponse.json({
        data: {
          storeReviewSummary: {
            averageRating: 4.6,
            totalCount: 1,
            productBreakdown: [],
          },
        },
      }),
    ),
  );
});

describe('SellerTabs hover-prefetch journey', () => {
  it('prefetches seller products listing once with zero visible tab change', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;
        expect(variables).toMatchObject({ storeId: STORE_ID, page: 1, limit: 24 });
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

    render(
      <SellerTabs activeTab="reviews" storeHandle={STORE_SLUG} storeId={STORE_ID} />,
      { wrapper: createWrapper() },
    );

    const productsTab = screen.getByRole('tab', { name: 'สินค้า' });
    const classNameBefore = productsTab.className;
    const styleBefore = productsTab.getAttribute('style');

    fireEvent.mouseEnter(productsTab);
    fireEvent.focus(productsTab);

    await waitFor(() => {
      expect(productsCallCount).toBe(1);
    });

    expect(productsTab.className).toBe(classNameBefore);
    expect(productsTab.getAttribute('style')).toBe(styleBefore);

    fireEvent.mouseEnter(productsTab);
    expect(productsCallCount).toBe(1);
  });

  it('does not prefetch the already-active tab', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', () => {
        productsCallCount += 1;
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

    render(
      <SellerTabs
        activeTab="products"
        storeHandle={STORE_SLUG}
        storeId={STORE_ID}
        initialProducts={[SAMPLE_PRODUCT]}
      />,
      { wrapper: createWrapper() },
    );

    await screen.findByText('Premium Dog Food 5kg');

    const countAfterRender = productsCallCount;
    const reviewsTab = screen.getByRole('tab', { name: 'รีวิว' });
    fireEvent.mouseEnter(reviewsTab);

    expect(productsCallCount).toBe(countAfterRender);
  });
});
