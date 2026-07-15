import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { SESSION_ID_COOKIE } from '@/lib/session';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CATALOG_STORE_ID } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

// AC-035, AC-037: Smart Search SSR order stays stable after hydration with sessionId parity.
// @category: fixture-e2e
// @lane: fixture-e2e

const SESSION_ID = '11111111-1111-4111-8111-111111111111';

const ORDERED_PRODUCTS = [
  {
    __typename: 'ProductType' as const,
    id: 'prod-c',
    name: 'Smart Search Product C',
    slug: 'smart-search-product-c',
    storeId: CATALOG_STORE_ID,
    basePrice: 300,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/c.jpg',
    averageRating: 4,
    reviewCount: 1,
    soldCount: 1,
    variants: null,
    store: {
      __typename: 'StoreType' as const,
      id: CATALOG_STORE_ID,
      name: 'SOPet Pet Shop',
      slug: 'sopet-pet-shop',
    },
  },
  {
    __typename: 'ProductType' as const,
    id: 'prod-a',
    name: 'Smart Search Product A',
    slug: 'smart-search-product-a',
    storeId: CATALOG_STORE_ID,
    basePrice: 100,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/a.jpg',
    averageRating: 4,
    reviewCount: 1,
    soldCount: 1,
    variants: null,
    store: {
      __typename: 'StoreType' as const,
      id: CATALOG_STORE_ID,
      name: 'SOPet Pet Shop',
      slug: 'sopet-pet-shop',
    },
  },
  {
    __typename: 'ProductType' as const,
    id: 'prod-b',
    name: 'Smart Search Product B',
    slug: 'smart-search-product-b',
    storeId: CATALOG_STORE_ID,
    basePrice: 200,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/b.jpg',
    averageRating: 4,
    reviewCount: 1,
    soldCount: 1,
    variants: null,
    store: {
      __typename: 'StoreType' as const,
      id: CATALOG_STORE_ID,
      name: 'SOPet Pet Shop',
      slug: 'sopet-pet-shop',
    },
  },
];

let searchParams = new URLSearchParams();
const capturedVariables: Array<Record<string, unknown>> = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/search',
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

function getRenderedProductOrder(): string[] {
  const listing = screen.getByTestId('product-listing');
  return Array.from(listing.querySelectorAll('a[href^="/product/"]')).map(
    (link) => link.getAttribute('href')?.replace('/product/', '') ?? '',
  );
}

beforeEach(() => {
  searchParams = new URLSearchParams({ q: 'อาหารแมว' });
  capturedVariables.length = 0;
  document.cookie = `${SESSION_ID_COOKIE}=${SESSION_ID}; path=/`;
  window.sessionStorage.setItem('sopet_recent_searches', JSON.stringify(['cat food']));

  server.use(
    graphql.query('Products', ({ variables }) => {
      capturedVariables.push(variables as Record<string, unknown>);
      return HttpResponse.json({
        data: {
          products: {
            items: ORDERED_PRODUCTS,
            pagination: { page: 1, limit: 40, total: 3, totalPages: 1 },
          },
        },
      });
    }),
  );
});

describe('Smart search page fixture-e2e', () => {
  it('preserves smart-search product order after hydration and sends sessionId', async () => {
    const { rerender } = render(<SearchResultsPage initialProducts={ORDERED_PRODUCTS} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText('Smart Search Product C')).toBeInTheDocument();
    const firstPaintOrder = getRenderedProductOrder();
    expect(firstPaintOrder).toEqual(['prod-c', 'prod-a', 'prod-b']);
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();

    rerender(<SearchResultsPage initialProducts={ORDERED_PRODUCTS} />);

    expect(getRenderedProductOrder()).toEqual(firstPaintOrder);
    expect(capturedVariables.some((variables) => variables.sessionId === SESSION_ID)).toBe(true);
    expect(
      capturedVariables.some(
        (variables) =>
          Array.isArray((variables.searchContext as { recentQueries?: string[] })?.recentQueries) &&
          ((variables.searchContext as { recentQueries?: string[] }).recentQueries ?? []).includes(
            'cat food',
          ),
      ),
    ).toBe(true);
  });
});
