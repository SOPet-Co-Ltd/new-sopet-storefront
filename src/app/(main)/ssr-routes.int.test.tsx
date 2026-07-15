import { render, screen } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage/ProductDetailsPage';
import { ProductListing } from '@/components/sections/ProductListing/ProductListing';
import { SellerStorefront } from '@/components/organisms/SellerTabs/SellerTabs';
import { CartProvider } from '@/lib/providers/CartProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/categories/dog-food',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
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

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const SAMPLE_PRODUCT_CARD = {
  __typename: 'ProductType' as const,
  id: 'prod-1',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food',
  storeId: 'store-1',
  basePrice: 599,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/product.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 40,
  variants: null,
  store: null,
};

const SAMPLE_PRODUCT_DETAIL = {
  __typename: 'ProductType' as const,
  id: 'prod-1',
  slug: 'premium-dog-food',
  storeId: 'store-1',
  name: 'Premium Dog Food 5kg',
  description: 'Great food',
  basePrice: 599,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/product.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 40,
  status: 'published',
  category: 'dog-food',
  tags: [],
  warning: null,
  expiryDate: null,
  store: {
    id: 'store-1',
    name: 'Happy Pets',
    slug: 'happy-pets',
    logoUrl: null,
    bannerUrl: null,
    description: null,
  },
  images: [],
  variants: null,
};

const SAMPLE_STORE = {
  __typename: 'StoreType' as const,
  id: 'store-1',
  name: 'Happy Pets',
  slug: 'happy-pets',
  logoUrl: null,
  bannerUrl: null,
  description: 'Pet store',
  status: 'approved',
};

function createPdpWrapper() {
  const ApolloTestWrapper = createApolloTestWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloTestWrapper>
        <CartProvider>{children}</CartProvider>
      </ApolloTestWrapper>
    );
  };
}

describe('PDP SSR reconciliation', () => {
  it('renders product details from initialProduct without skeleton', () => {
    server.use(
      graphql.query('Cart', () => HttpResponse.json({ data: { cart: null } })),
      graphql.query('ProductReviews', () => HttpResponse.json({ data: { productReviews: [] } })),
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({ data: { storeReviewSummary: null } }),
      ),
    );

    render(<ProductDetailsPage productId="prod-1" initialProduct={SAMPLE_PRODUCT_DETAIL} />, {
      wrapper: createPdpWrapper(),
    });

    expect(screen.getByTestId('product-details-page')).toBeInTheDocument();
    expect(screen.getAllByText('Premium Dog Food 5kg').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('product-details-loading')).not.toBeInTheDocument();
  });
});

describe('Category SSR reconciliation', () => {
  it('renders page-1 products from initialProducts without skeleton', () => {
    render(<ProductListing category="dog-food" initialProducts={[SAMPLE_PRODUCT_CARD]} />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing')?.querySelector('.animate-pulse')).toBeNull();
  });
});

describe('Seller SSR reconciliation', () => {
  it('renders seller storefront from initialStore without skeleton', () => {
    render(
      <SellerStorefront
        handle="happy-pets"
        activeTab="products"
        initialStore={SAMPLE_STORE}
        initialProducts={[SAMPLE_PRODUCT_CARD]}
      />,
      { wrapper: createApolloTestWrapper() },
    );

    expect(screen.getByText('Happy Pets')).toBeInTheDocument();
    expect(screen.queryByTestId('seller-storefront-skeleton')).not.toBeInTheDocument();
  });
});
