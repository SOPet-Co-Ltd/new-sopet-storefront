import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HomeProductSection } from '@/components/sections/HomeProductSection/HomeProductSection';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

const STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
const CURRENT_PRODUCT_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

const CURRENT_PRODUCT = {
  __typename: 'ProductType' as const,
  id: CURRENT_PRODUCT_ID,
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
    slug: 'sopet-pet-shop',
  },
};

const SAME_STORE_PRODUCT = {
  ...CURRENT_PRODUCT,
  id: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  name: 'Dog Treats',
  slug: 'dog-treats',
  basePrice: 120,
};

const OTHER_STORE_PRODUCT = {
  ...CURRENT_PRODUCT,
  id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  name: 'Cat Litter 10L',
  slug: 'cat-litter-10l',
  storeId: 'store-2',
  basePrice: 320,
  store: {
    __typename: 'StoreType' as const,
    id: 'store-2',
    name: 'Other Shop',
    slug: 'other-shop',
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => `/product/${CURRENT_PRODUCT_ID}`,
  useSearchParams: () => new URLSearchParams(),
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

function createWrapper() {
  const ApolloTestWrapper = createApolloTestWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ApolloTestWrapper>{children}</ApolloTestWrapper>;
  };
}

describe('HomeProductSection same-store filtering', () => {
  it('requests store-scoped products and excludes the current product', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({
          storeId: STORE_ID,
          page: 1,
          limit: 11,
        });

        return HttpResponse.json({
          data: {
            products: {
              items: [CURRENT_PRODUCT, SAME_STORE_PRODUCT, OTHER_STORE_PRODUCT],
              pagination: { page: 1, limit: 6, total: 3, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(
      <HomeProductSection
        heading="สินค้าจากร้านเดียวกัน"
        storeId={STORE_ID}
        excludeProductId={CURRENT_PRODUCT_ID}
        sameStoreOnly
        layout="grid"
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('Dog Treats')).toBeInTheDocument();
    expect(screen.queryByText('Premium Dog Food 5kg')).not.toBeInTheDocument();
    expect(screen.queryByText('Cat Litter 10L')).not.toBeInTheDocument();
  });

  it('does not render when no same-store products remain after exclusion', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [CURRENT_PRODUCT],
              pagination: { page: 1, limit: 6, total: 1, totalPages: 1 },
            },
          },
        }),
      ),
    );

    const { container } = render(
      <HomeProductSection
        heading="สินค้าจากร้านเดียวกัน"
        storeId={STORE_ID}
        excludeProductId={CURRENT_PRODUCT_ID}
        sameStoreOnly
        layout="grid"
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.queryByText('สินค้าจากร้านเดียวกัน')).not.toBeInTheDocument();
    });
    expect(container.firstChild).toBeNull();
  });
});

describe('HomeProductSection personalized recommendations', () => {
  it('requests category-scoped products with current product context for guests', async () => {
    server.use(
      graphql.query('Products', ({ variables }) => {
        expect(variables).toMatchObject({
          category: 'dog-food',
          page: 1,
          limit: 11,
          sortBy: 'soldCount',
          sortOrder: 'DESC',
          sessionId: 'session-test',
          searchContext: {
            recentProductIds: [CURRENT_PRODUCT_ID],
          },
        });

        return HttpResponse.json({
          data: {
            products: {
              items: [CURRENT_PRODUCT, OTHER_STORE_PRODUCT],
              pagination: { page: 1, limit: 11, total: 2, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(
      <HomeProductSection
        heading="สินค้าที่คุณอาจจะชอบ"
        referenceProduct={{
          id: CURRENT_PRODUCT_ID,
          category: 'dog-food',
          tags: ['dog', 'food'],
          storeId: STORE_ID,
        }}
        layout="grid"
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('Cat Litter 10L')).toBeInTheDocument();
    expect(screen.queryByText('Premium Dog Food 5kg')).not.toBeInTheDocument();
  });

  it('falls back to broader recommendations when category has no other products', async () => {
    let productsCallCount = 0;

    server.use(
      graphql.query('Products', ({ variables }) => {
        productsCallCount += 1;

        if (variables.category === 'food') {
          return HttpResponse.json({
            data: {
              products: {
                items: [CURRENT_PRODUCT],
                pagination: { page: 1, limit: 11, total: 1, totalPages: 1 },
              },
            },
          });
        }

        expect(variables).toMatchObject({
          page: 1,
          limit: 11,
          sortBy: 'soldCount',
          sortOrder: 'DESC',
        });
        expect(variables.category).toBeUndefined();

        return HttpResponse.json({
          data: {
            products: {
              items: [CURRENT_PRODUCT, SAME_STORE_PRODUCT, OTHER_STORE_PRODUCT],
              pagination: { page: 1, limit: 11, total: 3, totalPages: 1 },
            },
          },
        });
      }),
    );

    render(
      <HomeProductSection
        heading="สินค้าที่คุณอาจจะชอบ"
        referenceProduct={{
          id: CURRENT_PRODUCT_ID,
          category: 'food',
          tags: ['pet', 'food'],
          storeId: STORE_ID,
        }}
        layout="grid"
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('Dog Treats')).toBeInTheDocument();
    expect(screen.getByText('Cat Litter 10L')).toBeInTheDocument();
    expect(screen.queryByText('Premium Dog Food 5kg')).not.toBeInTheDocument();
    expect(productsCallCount).toBeGreaterThanOrEqual(2);
  });
});
