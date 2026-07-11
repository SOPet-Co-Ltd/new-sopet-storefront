import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryPLP } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleCategories, samplePetTypes, sampleProductCard } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

const push = vi.fn();
let pathname = '/categories/dog-food';
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

beforeEach(() => {
  pathname = '/categories/dog-food';
  searchParams = new URLSearchParams();
  push.mockClear();
});

describe('CategoryPLP search taxonomy layout', () => {
  it('renders SearchFilterSidebar alongside product listing in SearchResultsLayout (AC-018)', async () => {
    server.use(
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
      ),
      graphql.query('ApprovedPetTypes', () =>
        HttpResponse.json({ data: { approvedPetTypes: samplePetTypes } }),
      ),
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ category: 'Dog Food', page: 1 });
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    const { container } = render(
      <CategoryPLP categorySlug="dog-food" categoryFilter="Dog Food" />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByTestId('search-filter-sidebar')).toBeInTheDocument();
    expect(await screen.findByTestId('product-listing')).toBeInTheDocument();
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();

    const layout = container.querySelector('.lg\\:flex-row');
    expect(layout).toBeTruthy();
  });

  it('uses SSR categoryFilter while categories are loading and shows slug in header (AC-025)', async () => {
    let productsVariables: Record<string, unknown> | undefined;

    server.use(
      graphql.query('ApprovedCategories', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ data: { approvedCategories: sampleCategories } });
      }),
      graphql.query('ApprovedPetTypes', () =>
        HttpResponse.json({ data: { approvedPetTypes: samplePetTypes } }),
      ),
      graphql.query('Products', ({ variables }) => {
        productsVariables = variables;
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(
      <CategoryPLP
        categorySlug="dog-food"
        categoryFilter="Dog Food"
        initialProducts={[sampleProductCard]}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('heading', { level: 1, name: 'dog-food' })).toBeInTheDocument();
    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(productsVariables).toMatchObject({ category: 'Dog Food' });
  });

  it('shows empty state for unknown slug without unfiltered products query (AC-026)', async () => {
    let productsRequested = false;

    server.use(
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
      ),
      graphql.query('ApprovedPetTypes', () =>
        HttpResponse.json({ data: { approvedPetTypes: samplePetTypes } }),
      ),
      graphql.query('Products', () => {
        productsRequested = true;
        return HttpResponse.json({
          data: {
            products: {
              items: [sampleProductCard],
              pagination: { page: 1, limit: 24, total: 1, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(<CategoryPLP categorySlug="invalid-slug" />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('empty-search-results')).toBeInTheDocument();
    expect(screen.getByText('ไม่พบสินค้าในหมวดหมู่นี้')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing')).not.toBeInTheDocument();
    expect(screen.getByTestId('search-filter-sidebar')).toBeInTheDocument();
    expect(productsRequested).toBe(false);
  });
});
