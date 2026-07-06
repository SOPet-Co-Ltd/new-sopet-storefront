import { ApolloProvider } from '@apollo/client/react';
import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { getApolloClient } from '@/lib/graphql/client';
import { server } from '@/test/mocks/server';

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';

const SAMPLE_PRODUCT = {
  __typename: 'ProductType' as const,
  id: 'prod-001',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg',
  storeId: STORE_ID,
  basePrice: 890,
  compareAtPrice: 1200,
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

let searchParams = new URLSearchParams();

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

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
  };
}

beforeEach(() => {
  searchParams = new URLSearchParams();
});

afterEach(async () => {
  await getApolloClient().clearStore();
});

describe('SearchResultsPage', () => {
  it('renders search results when q param is present', async () => {
    searchParams = new URLSearchParams({ q: 'dog' });

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ search: 'dog', page: 1, limit: 24 });
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

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByText('ผลการค้นหา "dog"')).toBeInTheDocument();
  });

  it('shows empty state when q param is missing', async () => {
    searchParams = new URLSearchParams();

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(screen.getByTestId('empty-search-results')).toBeInTheDocument();
    expect(screen.getByText('ไม่พบสินค้า')).toBeInTheDocument();
  });

  it('shows empty state when q param is blank', async () => {
    searchParams = new URLSearchParams({ q: '   ' });

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(screen.getByTestId('empty-search-results')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing')).not.toBeInTheDocument();
  });
});
