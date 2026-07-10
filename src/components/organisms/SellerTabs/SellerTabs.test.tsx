import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellerStorefront } from '@/components/organisms/SellerTabs';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
const STORE_SLUG = 'sopet-pet-shop';

const SAMPLE_STORE = {
  __typename: 'StoreType' as const,
  id: STORE_ID,
  name: 'SOPet Pet Shop',
  slug: STORE_SLUG,
  logoUrl: null,
  bannerUrl: null,
  description: 'Your trusted pet shop',
  status: 'approved',
};

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

const SAMPLE_STORE_REVIEW_SUMMARY = {
  averageRating: 4.6,
  totalCount: 24,
  productBreakdown: [
    {
      productId: 'prod-001',
      productName: 'Premium Dog Food 5kg',
      averageRating: 4.5,
      reviewCount: 12,
    },
  ],
};

const push = vi.fn();
let pathname = `/sellers/${STORE_SLUG}`;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

function registerSellerHandlers() {
  server.use(
    graphql.query('StoreBySlug', ({ variables }) => {
      expect(variables).toMatchObject({ slug: STORE_SLUG });
      return HttpResponse.json({ data: { storeBySlug: SAMPLE_STORE } });
    }),
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
    graphql.query('StoreReviewSummary', ({ variables }) => {
      expect(variables).toMatchObject({ storeId: STORE_ID });
      return HttpResponse.json({ data: { storeReviewSummary: SAMPLE_STORE_REVIEW_SUMMARY } });
    }),
  );
}

beforeEach(() => {
  pathname = `/sellers/${STORE_SLUG}`;
  push.mockClear();
});

describe('SellerStorefront', () => {
  it('loads seller heading and products tab without authentication', async () => {
    registerSellerHandlers();

    render(<SellerStorefront handle={STORE_SLUG} activeTab="products" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('seller-heading')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'SOPet Pet Shop' })).toBeInTheDocument();
    expect(screen.getByText('Your trusted pet shop')).toBeInTheDocument();
    expect(screen.getByTestId('seller-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('product-listing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ดู Premium Dog Food 5kg' })).toBeInTheDocument();
  });

  it('shows review summary on reviews tab', async () => {
    registerSellerHandlers();
    pathname = `/sellers/${STORE_SLUG}/reviews`;

    server.use(
      graphql.query('StoreReviews', ({ variables }) => {
        expect(variables).toMatchObject({ storeId: STORE_ID });
        return HttpResponse.json({ data: { storeReviews: [] } });
      }),
    );

    render(<SellerStorefront handle={STORE_SLUG} activeTab="reviews" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('seller-review-tab')).toBeInTheDocument();
    });

    expect(screen.getByText('คะแนนร้านค้า')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('24 รีวิว')).toBeInTheDocument();
    expect(screen.getByText('รีวิวจากลูกค้า')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing')).not.toBeInTheDocument();
  });

  it('renders tab links for products and reviews routes', async () => {
    registerSellerHandlers();

    render(<SellerStorefront handle={STORE_SLUG} activeTab="products" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('seller-tabs')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'สินค้า' })).toHaveAttribute(
      'href',
      `/sellers/${STORE_SLUG}`,
    );
    expect(screen.getByRole('tab', { name: 'รีวิว' })).toHaveAttribute(
      'href',
      `/sellers/${STORE_SLUG}/reviews`,
    );
  });

  it('shows not found when storeBySlug returns null', async () => {
    server.use(
      graphql.query('StoreBySlug', () => {
        return HttpResponse.json({ data: { storeBySlug: null } });
      }),
    );

    render(<SellerStorefront handle="missing-store" activeTab="products" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('seller-storefront-not-found')).toBeInTheDocument();
    });

    expect(screen.getByText('ไม่พบร้านค้า')).toBeInTheDocument();
  });
});
