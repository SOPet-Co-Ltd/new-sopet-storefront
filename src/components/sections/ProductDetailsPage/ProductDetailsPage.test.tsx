import { ApolloProvider } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage';
import { getApolloClient } from '@/lib/graphql/client';
import { CartProvider } from '@/lib/providers/CartProvider';
import { server } from '@/test/mocks/server';

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
const PRODUCT_ID = 'prod-001';
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
  id: 'prod-002',
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

function createWrapper() {
  const client = getApolloClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloProvider client={client}>
        <CartProvider>{children}</CartProvider>
      </ApolloProvider>
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
      expect(variables.storeId).toBe(STORE_ID);
      return HttpResponse.json({
        data: {
          products: {
            items: [SAMPLE_STORE_PRODUCT],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
            },
          },
        },
      });
    }),
  );
}

afterEach(async () => {
  notFound.mockClear();
  await getApolloClient().clearStore();
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
    expect(screen.getByTestId('store-review-average')).toHaveTextContent('4.5');
  });

  it('updates price and stock when variant is changed', async () => {
    mockProductQueries();
    const user = userEvent.setup();

    render(<ProductDetailsPage productId={PRODUCT_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByTestId('variant-price')).toHaveTextContent('฿890');
    expect(screen.getByTestId('variant-stock')).toHaveTextContent('เหลือสินค้า 10 ชิ้น');

    await user.click(screen.getByRole('radio', { name: 'Size: L' }));

    expect(screen.getByTestId('variant-price')).toHaveTextContent('฿990');
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
});
