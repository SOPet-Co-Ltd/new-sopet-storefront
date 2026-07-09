import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
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
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/search',
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
});

describe('SearchResultsPage', () => {
  it('renders search results when q param is present', async () => {
    searchParams = new URLSearchParams({ q: 'dog' });

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ search: 'dog', page: 1, limit: 40 });
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 40, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByText('ผลการค้นหาทั้งหมด "dog"')).toBeInTheDocument();
    expect(screen.getByTestId('search-filter-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('search-sort-bar')).toBeInTheDocument();
  });

  it('shows all products when q param is missing', async () => {
    searchParams = new URLSearchParams();

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ page: 1, limit: 40 });
        expect(variables.search).toBeUndefined();
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 40, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByTestId('search-filter-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('search-sort-bar')).toBeInTheDocument();
    expect(screen.getByText('สินค้าทั้งหมด (1)')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-search-results')).not.toBeInTheDocument();
  });

  it('passes filter params when filters are applied', async () => {
    searchParams = new URLSearchParams({
      q: 'dog',
      petType: 'pet-cat',
      brand: 'brand-1',
      minPrice: '500',
      maxPrice: '5000',
    });

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({
          search: 'dog',
          page: 1,
          limit: 40,
          petTypeIds: ['pet-cat'],
          brandIds: ['brand-1'],
          minPrice: 500,
          maxPrice: 5000,
        });
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 40, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
  });

  it('passes sort params when a sort option is selected', async () => {
    searchParams = new URLSearchParams({ q: 'dog', sort: 'price-asc' });

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({
          search: 'dog',
          page: 1,
          limit: 40,
          sortBy: 'basePrice',
          sortOrder: 'ASC',
        });
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 40, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
  });

  it('shows all products when q param is blank', async () => {
    searchParams = new URLSearchParams({ q: '   ' });

    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ page: 1, limit: 40 });
        expect(variables.search).toBeUndefined();
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_PRODUCT],
              pagination: { page: 1, limit: 40, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<SearchResultsPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByTestId('product-listing')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-search-results')).not.toBeInTheDocument();
  });
});
