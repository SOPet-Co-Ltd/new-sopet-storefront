import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductCard, { buildProductHref } from '@/components/organisms/ProductCard';
import { CategoryIndexPage, ProductListing } from '@/components/sections/ProductListing';
import { PRODUCT_CARD_GRID_CLASS } from '@/components/sections/ProductListing/productListingGrid';
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

const SAMPLE_CATEGORIES = [
  { __typename: 'CategoryType' as const, id: 'cat-1', name: 'อาหารสุนัข', slug: 'dog-food' },
  { __typename: 'CategoryType' as const, id: 'cat-2', name: 'อาหารแมว', slug: 'cat-food' },
];

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

describe('ProductCard', () => {
  it('links to PDP by product id', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);

    const link = screen.getByRole('link', { name: 'ดู Premium Dog Food 5kg' });
    expect(link).toHaveAttribute('href', buildProductHref(SAMPLE_PRODUCT.id));
  });
});

describe('ProductListing', () => {
  it('lists products for a category', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({ category: 'dog-food', page: 1, limit: 24 });
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

    render(<ProductListing category="dog-food" />, { wrapper: createWrapper() });

    expect(await screen.findByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByText('สินค้าทั้งหมด 1')).toBeInTheDocument();

    const grid = screen.getByRole('list');
    expect(grid).toHaveClass(...PRODUCT_CARD_GRID_CLASS.split(' '));
  });

  it('navigates to next page when pagination is clicked', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        const page = (variables.page as number) ?? 1;
        return HttpResponse.json({
          data: {
            products: {
              items:
                page === 1
                  ? [SAMPLE_PRODUCT]
                  : [
                      {
                        ...SAMPLE_PRODUCT,
                        id: 'prod-002',
                        name: 'Cat Litter 10L',
                        slug: 'cat-litter-10l',
                      },
                    ],
              pagination: { page, limit: 24, total: 30, totalPages: 2 },
            },
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(<ProductListing category="dog-food" />, { wrapper: createWrapper() });

    await screen.findByText('Premium Dog Food 5kg');

    const nextButtons = screen.getAllByRole('button', { name: 'หน้าถัดไป' });
    await user.click(nextButtons[0]);

    expect(push).toHaveBeenCalledWith('/categories/dog-food?page=2');
  });

  it('shows empty state when category has no products', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [],
              pagination: { page: 1, limit: 24, total: 0, totalPages: 0 },
            },
          },
        }),
      ),
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: SAMPLE_CATEGORIES } }),
      ),
    );

    render(<ProductListing category="dog-food" />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('empty-search-results')).toBeInTheDocument();
    expect(screen.getByText('ไม่พบสินค้า')).toBeInTheDocument();
    expect(await screen.findByText('อาหารสุนัข')).toBeInTheDocument();
  });
});

describe('CategoryIndexPage', () => {
  it('renders approved categories grid', async () => {
    server.use(
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: SAMPLE_CATEGORIES } }),
      ),
    );

    render(<CategoryIndexPage />, { wrapper: createWrapper() });

    expect(await screen.findByTestId('category-index-page')).toBeInTheDocument();
    expect(screen.getByText('อาหารสุนัข')).toBeInTheDocument();
    expect(screen.getByText('อาหารแมว')).toBeInTheDocument();
  });
});
