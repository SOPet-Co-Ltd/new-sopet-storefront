// Storefront SEO / AEO / GEO fixture-e2e Test - Design Doc: storefront-seo-aeo-geo-frontend-design.md
// UI Spec: storefront-seo-aeo-geo-ui-spec.md
// Generated: 2026-07-13 | Budget Used: 0/3 integration, 3/3 fixture-e2e, 0/2 service-e2e

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage/ProductDetailsPage';
import { HomeCategories } from '@/components/sections/HomeCategories';
import { CategoryPLP } from '@/components/sections/ProductListing';
import { CartProvider } from '@/lib/providers/CartProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  CATALOG_PRODUCT_ID,
  sampleCategories,
  samplePetTypes,
  sampleProductCard,
  sampleProductDetail,
} from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

// @category: fixture-e2e
// @lane: fixture-e2e

const push = vi.fn();
let pathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, prefetch: vi.fn() }),
  usePathname: () => pathname,
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

function createJourneyWrapper() {
  const ApolloTestWrapper = createApolloTestWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ApolloTestWrapper>
        <CartProvider>{children}</CartProvider>
      </ApolloTestWrapper>
    );
  };
}

function registerHomeFixtureHandlers() {
  server.use(
    graphql.query('PlatformBanners', () =>
      HttpResponse.json({
        data: {
          platformBanners: [
            {
              id: 'banner-1',
              title: 'Welcome',
              imageUrl: 'https://example.com/banner.jpg',
              linkUrl: '/products',
              sortOrder: 1,
              isActive: true,
              startsAt: null,
              endsAt: null,
            },
          ],
        },
      }),
    ),
    graphql.query('ApprovedCategories', () =>
      HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
    ),
    graphql.query('Products', () =>
      HttpResponse.json({
        data: {
          products: {
            items: [sampleProductCard],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          },
        },
      }),
    ),
    graphql.query('RecommendedProducts', () =>
      HttpResponse.json({ data: { recommendedProducts: [sampleProductCard] } }),
    ),
    graphql.query('PlatformSponsors', () => HttpResponse.json({ data: { platformSponsors: [] } })),
    graphql.query('LatestPurchaseProducts', () =>
      HttpResponse.json({ data: { latestPurchaseProducts: [] } }),
    ),
  );
}

function registerCategoryFixtureHandlers() {
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
}

function registerPdpFixtureHandlers() {
  server.use(
    graphql.query('ApprovedCategories', () =>
      HttpResponse.json({ data: { approvedCategories: sampleCategories } }),
    ),
    graphql.query('ProductById', () =>
      HttpResponse.json({ data: { product: sampleProductDetail } }),
    ),
    graphql.query('ProductReviews', () => HttpResponse.json({ data: { productReviews: [] } })),
    graphql.query('StoreReviewSummary', () =>
      HttpResponse.json({ data: { storeReviewSummary: null } }),
    ),
    graphql.query('Cart', () => HttpResponse.json({ data: { cart: null } })),
    graphql.query('Products', () =>
      HttpResponse.json({
        data: {
          products: {
            items: [sampleProductCard],
            pagination: { page: 1, limit: 11, total: 1, totalPages: 1 },
          },
        },
      }),
    ),
  );
}

beforeEach(() => {
  pathname = '/';
  push.mockClear();
});

describe('fixture-e2e — SEO semantic HTML journeys', () => {
  it('traverses Home → Category → PDP with aligned heading and breadcrumb trail', async () => {
    const user = userEvent.setup();
    registerHomeFixtureHandlers();

    const { unmount: unmountHome } = render(
      <HomeCategories initialCategories={sampleCategories} />,
      { wrapper: createJourneyWrapper() },
    );

    const categoryLink = screen.getByRole('link', { name: 'ดูหมวดหมู่ Dog Food' });
    await user.click(categoryLink);
    unmountHome();

    registerCategoryFixtureHandlers();
    pathname = '/categories/dog-food';

    const { unmount: unmountCategory } = render(
      <CategoryPLP
        categorySlug="dog-food"
        categoryFilter="Dog Food"
        initialProducts={[sampleProductCard]}
      />,
      { wrapper: createJourneyWrapper() },
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Dog Food' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();

    const productLink = screen.getByRole('link', { name: `ดู ${sampleProductCard.name}` });
    await user.click(productLink);
    unmountCategory();

    registerPdpFixtureHandlers();
    pathname = `/product/${CATALOG_PRODUCT_ID}`;

    render(
      <ProductDetailsPage productId={CATALOG_PRODUCT_ID} initialProduct={sampleProductDetail} />,
      { wrapper: createJourneyWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-details-page')).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName(sampleProductDetail.name);

    const breadcrumbNav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(breadcrumbNav).toBeInTheDocument();
    expect(breadcrumbNav.querySelector('ol')).toBeInTheDocument();

    const categoryCrumb = screen.getByRole('link', { name: 'Dog Food' });
    expect(categoryCrumb).toHaveAttribute('href', '/categories/dog-food');

    const currentCrumb = within(breadcrumbNav).getByText(sampleProductDetail.name);
    expect(currentCrumb).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: sampleProductDetail.name })).not.toBeInTheDocument();

    await user.click(categoryCrumb);
    expect(categoryCrumb).toHaveAttribute('href', '/categories/dog-food');
  });

  it('renders category breadcrumbs above the category h1 with correct trail', async () => {
    registerCategoryFixtureHandlers();

    const { container } = render(
      <CategoryPLP
        categorySlug="dog-food"
        categoryFilter="Dog Food"
        initialProducts={[sampleProductCard]}
      />,
      { wrapper: createJourneyWrapper() },
    );

    const breadcrumbNav = await screen.findByRole('navigation', { name: 'breadcrumb' });
    const categoryHeading = await screen.findByRole('heading', {
      level: 1,
      name: 'Dog Food',
    });

    expect(screen.getByRole('link', { name: 'หน้าแรก' })).toHaveAttribute('href', '/');

    const currentCrumb = within(breadcrumbNav).getByText('Dog Food', { selector: 'span' });
    expect(currentCrumb).toHaveAttribute('aria-current', 'page');
    expect(within(breadcrumbNav).queryByRole('link', { name: 'Dog Food' })).not.toBeInTheDocument();

    const breadcrumbIndex = Array.from(container.querySelectorAll('nav, h1')).indexOf(
      breadcrumbNav,
    );
    const headingIndex = Array.from(container.querySelectorAll('nav, h1')).indexOf(categoryHeading);
    expect(breadcrumbIndex).toBeGreaterThanOrEqual(0);
    expect(headingIndex).toBeGreaterThan(breadcrumbIndex);
  });
});
