import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { SESSION_ID_COOKIE } from '@/lib/session';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CATALOG_STORE_ID } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

// AC-035, AC-037: Search listing wires sessionId + searchContext and preserves API order.
// @category: integration
// @lane: integration

const SESSION_ID = '22222222-2222-4222-8222-222222222222';

const ORDERED_PRODUCTS = [
  {
    __typename: 'ProductType' as const,
    id: 'id-3',
    name: 'Search Product Three',
    slug: 'search-product-three',
    storeId: CATALOG_STORE_ID,
    basePrice: 300,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/3.jpg',
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
    id: 'id-1',
    name: 'Search Product One',
    slug: 'search-product-one',
    storeId: CATALOG_STORE_ID,
    basePrice: 100,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/1.jpg',
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
    id: 'id-2',
    name: 'Search Product Two',
    slug: 'search-product-two',
    storeId: CATALOG_STORE_ID,
    basePrice: 200,
    compareAtPrice: null,
    thumbnailUrl: 'https://example.com/2.jpg',
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
  searchParams = new URLSearchParams({ q: 'dog food' });
  capturedVariables.length = 0;
  document.cookie = `${SESSION_ID_COOKIE}=${SESSION_ID}; path=/`;
  window.sessionStorage.setItem(
    'sopet_recent_searches',
    JSON.stringify(['cat food', 'dog treats']),
  );

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

describe('Smart search products integration', () => {
  it('sends sessionId and recent search context while preserving product order', async () => {
    const { rerender } = render(<SearchResultsPage initialProducts={ORDERED_PRODUCTS} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('Search Product Three')).toBeInTheDocument();
    });

    const initialOrder = getRenderedProductOrder();
    expect(initialOrder).toEqual(['id-3', 'id-1', 'id-2']);

    rerender(<SearchResultsPage initialProducts={ORDERED_PRODUCTS} />);
    expect(getRenderedProductOrder()).toEqual(initialOrder);

    expect(capturedVariables.some((variables) => variables.sessionId === SESSION_ID)).toBe(true);
    expect(
      capturedVariables.some((variables) => {
        const recentQueries =
          (variables.searchContext as { recentQueries?: string[] } | undefined)?.recentQueries ??
          [];
        return recentQueries.includes('cat food') && recentQueries.includes('dog treats');
      }),
    ).toBe(true);
  });
});
