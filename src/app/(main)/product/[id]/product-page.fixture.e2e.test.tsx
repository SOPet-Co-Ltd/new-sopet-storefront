import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ProductCard from '@/components/organisms/ProductCard';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage/ProductDetailsPage';
import { CartProvider } from '@/lib/providers/CartProvider';
import {
  CATALOG_PRODUCT_ID,
  sampleProductCard,
  sampleProductDetail,
} from '@/test/mocks/fixtures/catalog';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

// AC-003: ProductCard hover-prefetch warms cache for PDP render without duplicate fetch.
// @category: fixture-e2e
// @lane: fixture-e2e

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

describe('Product page warm-cache fixture-e2e', () => {
  it('prefetches product details once when a product card is hovered', async () => {
    let productByIdCallCount = 0;

    server.use(
      graphql.query('ProductById', ({ variables }) => {
        productByIdCallCount += 1;
        expect(variables).toEqual({ id: CATALOG_PRODUCT_ID });
        return HttpResponse.json({ data: { product: sampleProductDetail } });
      }),
    );

    render(<ProductCard product={sampleProductCard} />, { wrapper: createPdpWrapper() });

    const cardLink = screen.getByRole('link', { name: `ดู ${sampleProductCard.name}` });
    fireEvent.mouseEnter(cardLink);
    fireEvent.focus(cardLink);

    await waitFor(() => {
      expect(productByIdCallCount).toBe(1);
    });
  });

  it('renders PDP from initialProduct without loading skeleton', async () => {
    server.use(
      graphql.query('ProductById', () =>
        HttpResponse.json({ data: { product: sampleProductDetail } }),
      ),
      graphql.query('Cart', () => HttpResponse.json({ data: { cart: null } })),
      graphql.query('ProductReviews', () => HttpResponse.json({ data: { productReviews: [] } })),
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({ data: { storeReviewSummary: null } }),
      ),
    );

    render(
      <ProductDetailsPage productId={CATALOG_PRODUCT_ID} initialProduct={sampleProductDetail} />,
      { wrapper: createPdpWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-details-page')).toBeInTheDocument();
    });

    expect(screen.getAllByText(sampleProductCard.name).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('product-details-loading')).not.toBeInTheDocument();
  });
});
