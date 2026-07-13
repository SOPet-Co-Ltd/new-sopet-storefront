import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage';
import { CartProvider } from '@/lib/providers/CartProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleCategories } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
const PRODUCT_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const SLUG = 'premium-dog-food-5kg';

const SAMPLE_PRODUCT_DETAIL = {
  __typename: 'ProductType' as const,
  id: PRODUCT_ID,
  name: 'Premium Dog Food 5kg',
  slug: SLUG,
  storeId: STORE_ID,
  basePrice: 890,
  compareAtPrice: 1200,
  thumbnailUrl: 'https://example.com/dog-food.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  description: 'High quality dog food for all breeds.',
  status: 'published',
  category: 'dog-food',
  tags: ['dog', 'food'],
  warning: null,
  expiryDate: null,
  store: {
    __typename: 'StoreType' as const,
    id: STORE_ID,
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
    logoUrl: null,
    bannerUrl: null,
    description: 'Your pet shop',
  },
  images: [
    {
      id: 'img-1',
      imageUrl: 'https://example.com/img1.jpg',
      isThumbnail: true,
      sortOrder: 0,
    },
    {
      id: 'img-2',
      imageUrl: 'https://example.com/img2.jpg',
      isThumbnail: false,
      sortOrder: 1,
    },
  ],
  variants: [
    {
      id: 'var-small',
      sku: 'DOG-S',
      price: 890,
      stockQuantity: 10,
      optionsJson: '{"size":"S"}',
    },
    {
      id: 'var-large',
      sku: 'DOG-L',
      price: 990,
      stockQuantity: 5,
      optionsJson: '{"size":"L"}',
    },
  ],
};

const SAMPLE_PRODUCT_REVIEW = {
  id: 'review-1',
  productId: PRODUCT_ID,
  rating: 5,
  comment: 'Great product',
  status: 'approved',
  createdAt: '2026-01-01T00:00:00.000Z',
  customerName: 'Test Customer',
  images: [{ id: 'img-r1', url: 'https://example.com/review.jpg' }],
};

const SAMPLE_STORE_PRODUCT = {
  __typename: 'ProductType' as const,
  id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  name: 'Dog Treats',
  slug: 'dog-treats',
  storeId: STORE_ID,
  basePrice: 120,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/treats.jpg',
  averageRating: 4.2,
  reviewCount: 3,
  soldCount: 10,
  store: {
    __typename: 'StoreType' as const,
    id: STORE_ID,
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

const notFound = vi.fn();

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => `/product/${PRODUCT_ID}`,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/useSessionId', () => ({
  useSessionId: () => 'session-test',
}));

vi.mock('@/lib/hooks/useSearchContext', async () => {
  const actual = await vi.importActual<typeof import('@/lib/hooks/useSearchContext')>(
    '@/lib/hooks/useSearchContext',
  );

  return {
    ...actual,
    useSearchContext: () => undefined,
  };
});

function createWrapper() {
  const ApolloTestWrapper = createApolloTestWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloTestWrapper>
        <CartProvider>{children}</CartProvider>
      </ApolloTestWrapper>
    );
  };
}

function mockProductQueries({
  product = SAMPLE_PRODUCT_DETAIL,
  productError,
}: {
  product?: typeof SAMPLE_PRODUCT_DETAIL | null;
  productError?: { code: string; message: string };
} = {}) {
  server.use(
    graphql.query('ProductById', ({ variables }) => {
      expect(variables).toEqual({ id: PRODUCT_ID });

      if (productError) {
        return HttpResponse.json({
          errors: [
            {
              message: productError.message,
              extensions: { code: productError.code },
            },
          ],
        });
      }

      return HttpResponse.json({ data: { product } });
    }),
    graphql.query('ApprovedCategories', () =>
      HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
    ),
    graphql.query('ProductReviews', ({ variables }) => {
      expect(variables).toEqual({ productId: PRODUCT_ID });
      return HttpResponse.json({ data: { productReviews: [SAMPLE_PRODUCT_REVIEW] } });
    }),
    graphql.query('StoreReviewSummary', ({ variables }) => {
      expect(variables).toEqual({ storeId: STORE_ID });
      return HttpResponse.json({
        data: {
          storeReviewSummary: {
            averageRating: 4.6,
            totalCount: 24,
            productBreakdown: [],
          },
        },
      });
    }),
    graphql.query('Products', ({ variables }) => {
      if (variables.storeId) {
        expect(variables).toMatchObject({
          storeId: STORE_ID,
          page: 1,
          limit: 11,
        });
        return HttpResponse.json({
          data: {
            products: {
              items: [SAMPLE_STORE_PRODUCT],
              pagination: {
                page: 1,
                limit: 11,
                total: 1,
                totalPages: 1,
              },
            },
          },
        });
      }

      expect(variables).toMatchObject({
        category: 'dog-food',
        page: 1,
        limit: 11,
        sortBy: 'soldCount',
        sortOrder: 'DESC',
        searchContext: {
          recentProductIds: [PRODUCT_ID],
        },
      });
      return HttpResponse.json({
        data: {
          products: {
            items: [
              {
                ...SAMPLE_STORE_PRODUCT,
                id: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
                name: 'Chew Toy Bone',
                storeId: 'store-2',
                store: {
                  __typename: 'StoreType',
                  id: 'store-2',
                  name: 'Other Shop',
                  slug: 'other-shop',
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 11,
              total: 1,
              totalPages: 1,
            },
          },
        },
      });
    }),
  );
}

afterEach(() => {
  notFound.mockClear();
});

describe('ProductDetailsPage', () => {
  it('renders gallery, variants, seller, and reviews by product id', async () => {
    mockProductQueries();

    render(<ProductDetailsPage productId={PRODUCT_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByTestId('product-details-page')).toBeInTheDocument();
    expect(screen.getByTestId('product-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('product-variant-selection')).toBeInTheDocument();
    expect(screen.getByTestId('product-seller')).toBeInTheDocument();
    expect(screen.getByText('SOPet Pet Shop')).toBeInTheDocument();
    expect(screen.getByText('รายละเอียดสินค้า')).toBeInTheDocument();
    expect(screen.getByText('High quality dog food for all breeds.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('product-reviews')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Customer')).toBeInTheDocument();
    expect(screen.getByText('Great product')).toBeInTheDocument();
    expect(screen.getByTestId('store-review-average')).toHaveTextContent('5');
  });

  it('updates price and stock when variant is changed', async () => {
    mockProductQueries();
    const user = userEvent.setup();

    render(<ProductDetailsPage productId={PRODUCT_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByTestId('variant-price')).toHaveTextContent('฿890.00');
    expect(screen.getByTestId('variant-stock')).toHaveTextContent('เหลือสินค้า 10 ชิ้น');

    await user.click(screen.getByRole('radio', { name: 'Size: L' }));

    expect(screen.getByTestId('variant-price')).toHaveTextContent('฿990.00');
    expect(screen.getByTestId('variant-stock')).toHaveTextContent('เหลือสินค้า 5 ชิ้น');
  });

  it('calls notFound when product is not found', async () => {
    mockProductQueries({
      product: null,
      productError: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
    });

    render(<ProductDetailsPage productId={PRODUCT_ID} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(notFound).toHaveBeenCalled();
    });
  });

  it('renders a single visible h1, article landmark, and breadcrumb trail with category crumb', async () => {
    mockProductQueries();

    const { container } = render(<ProductDetailsPage productId={PRODUCT_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByTestId('product-details-page')).toBeInTheDocument();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(SAMPLE_PRODUCT_DETAIL.name);
    expect(headings[0]).toHaveAttribute('id', 'product-title');

    const article = container.querySelector('article[aria-labelledby="product-title"]');
    expect(article).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(breadcrumbNav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'หน้าแรก' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dog Food' })).toHaveAttribute(
      'href',
      '/categories/dog-food',
    );
    expect(within(breadcrumbNav).getByText(SAMPLE_PRODUCT_DETAIL.name)).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
