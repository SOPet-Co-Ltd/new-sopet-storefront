import { ApolloProvider } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/components/pages/HomePage';
import { getApolloClient } from '@/lib/graphql/client';
import type { AuthContextValue } from '@/lib/providers/AuthProvider';
import { server } from '@/test/mocks/server';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

const SAMPLE_CATEGORIES = [
  { __typename: 'CategoryType' as const, id: 'cat-1', name: 'อาหารสุนัข', slug: 'dog-food' },
  { __typename: 'CategoryType' as const, id: 'cat-2', name: 'อาหารแมว', slug: 'cat-food' },
];

const SAMPLE_PRODUCT = {
  __typename: 'ProductType' as const,
  id: 'prod-1',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg',
  storeId: 'store-1',
  basePrice: 890,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/dog-food.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  store: {
    __typename: 'StoreType' as const,
    id: 'store-1',
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

const SAMPLE_BANNER = {
  __typename: 'PlatformBannerType' as const,
  id: 'banner-1',
  title: 'โปรโมชั่น',
  imageUrl: 'https://example.com/banner.jpg',
  linkUrl: '/categories',
  sortOrder: 1,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

const SAMPLE_SPONSOR = {
  __typename: 'PlatformSponsorType' as const,
  id: 'sponsor-1',
  name: 'Brand A',
  imageUrl: 'https://example.com/sponsor.jpg',
  linkUrl: 'https://example.com',
  sortOrder: 1,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

const SAMPLE_ORDER = {
  __typename: 'OrderType' as const,
  id: 'order-1',
  orderNumber: 'ORD-001',
  status: 'completed',
  subtotal: 890,
  shippingFee: 50,
  discountAmount: 0,
  total: 940,
  paymentMethod: 'card',
  items: [
    {
      __typename: 'OrderItemType' as const,
      id: 'item-1',
      storeId: 'store-1',
      productName: 'Premium Dog Food 5kg',
      unitPrice: 890,
      quantity: 1,
      subtotal: 890,
      fulfillmentStatus: 'delivered',
    },
  ],
};

function createAuthValue(isAuthenticated: boolean): AuthContextValue {
  return {
    customer: isAuthenticated ? { id: 'cust-1', phone: '0812345678', email: null, fullName: 'ทดสอบ' } : null,
    isAuthenticated,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  };
}

function registerHomeHandlers(options?: { includeOrders?: boolean }) {
  server.use(
    graphql.query('PlatformBanners', () =>
      HttpResponse.json({ data: { platformBanners: [SAMPLE_BANNER] } }),
    ),
    graphql.query('ApprovedCategories', () =>
      HttpResponse.json({ data: { approvedCategories: SAMPLE_CATEGORIES } }),
    ),
    graphql.query('Products', () =>
      HttpResponse.json({
        data: {
          products: {
            items: [SAMPLE_PRODUCT],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          },
        },
      }),
    ),
    graphql.query('RecommendedProducts', () =>
      HttpResponse.json({ data: { recommendedProducts: [SAMPLE_PRODUCT] } }),
    ),
    graphql.query('PlatformSponsors', () =>
      HttpResponse.json({ data: { platformSponsors: [SAMPLE_SPONSOR] } }),
    ),
    graphql.query('Orders', () =>
      HttpResponse.json({
        data: options?.includeOrders ? { orders: [SAMPLE_ORDER] } : { orders: [] },
      }),
    ),
  );
}

function renderHomePage() {
  const client = getApolloClient();
  return render(
    <ApolloProvider client={client}>
      <HomePage />
    </ApolloProvider>,
  );
}

describe('HomePage', () => {
  beforeEach(async () => {
    await getApolloClient().clearStore();
    mockedUseAuth.mockReturnValue(createAuthValue(false));
  });

  it('renders Thai section headings', async () => {
    registerHomeHandlers();

    renderHomePage();

    expect(await screen.findByRole('heading', { name: 'หมวดหมู่สินค้า' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'สินค้ามาใหม่' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'สินค้าแนะนำ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'แบรนด์ที่เข้าร่วม' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'คำถามที่พบบ่อย' })).toBeInTheDocument();
  });

  it('links category cards to category PLP routes', async () => {
    registerHomeHandlers();

    renderHomePage();

    const categoryLink = await screen.findByRole('link', { name: 'ดูหมวดหมู่ อาหารสุนัข' });
    expect(categoryLink).toHaveAttribute('href', '/categories/dog-food');
  });

  it('links product cards to PDP routes', async () => {
    registerHomeHandlers();

    renderHomePage();

    const productLinks = await screen.findAllByRole('link', {
      name: 'ดู Premium Dog Food 5kg',
    });

    expect(productLinks.length).toBeGreaterThan(0);
    expect(productLinks[0]).toHaveAttribute('href', `/product/${SAMPLE_PRODUCT.id}`);
  });

  it('hides recent orders section for guest users', async () => {
    registerHomeHandlers({ includeOrders: true });
    mockedUseAuth.mockReturnValue(createAuthValue(false));

    renderHomePage();

    await screen.findByRole('heading', { name: 'สินค้าแนะนำ' });

    await waitFor(() => {
      expect(screen.queryByTestId('home-recent-orders')).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'ซื้อล่าสุด' })).not.toBeInTheDocument();
  });

  it('shows recent orders section for authenticated users', async () => {
    registerHomeHandlers({ includeOrders: true });
    mockedUseAuth.mockReturnValue(createAuthValue(true));

    renderHomePage();

    expect(await screen.findByTestId('home-recent-orders')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ซื้อล่าสุด' })).toBeInTheDocument();
  });

  it('does not render coupon section or links', async () => {
    registerHomeHandlers();

    renderHomePage();

    await screen.findByRole('heading', { name: 'สินค้าแนะนำ' });

    expect(document.body.innerHTML).not.toContain('HomeCouponSection');
    expect(document.body.innerHTML).not.toContain('/coupons');
  });
});
