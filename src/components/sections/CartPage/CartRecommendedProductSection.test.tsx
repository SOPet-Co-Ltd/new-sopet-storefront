import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { graphql, HttpResponse } from 'msw';
import { CartRecommendedProductSection } from './CartRecommendedProductSection';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src={src} alt={alt} {...props} />
  ),
}));

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
  variants: null,
  store: {
    __typename: 'StoreType' as const,
    id: 'store-1',
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

const ApolloTestWrapper = createApolloTestWrapper();

describe('CartRecommendedProductSection', () => {
  it('renders headings, view-all link, and products', async () => {
    server.use(
      graphql.query('RecommendedProducts', () =>
        HttpResponse.json({ data: { recommendedProducts: [SAMPLE_PRODUCT] } }),
      ),
    );

    render(
      <ApolloTestWrapper>
        <CartRecommendedProductSection />
      </ApolloTestWrapper>,
    );

    const section = await screen.findByTestId('cart-recommended-products');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('สินค้าแนะนำ')).toBeInTheDocument();
    expect(screen.getByText('สินค้าที่คุณอาจสนใจ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ดูทั้งหมด' })).toHaveAttribute('href', '/recommend');
    expect(
      await screen.findByRole('link', { name: 'ดู Premium Dog Food 5kg' }),
    ).toBeInTheDocument();
  });

  it('hides section when recommended products are empty', async () => {
    server.use(
      graphql.query('RecommendedProducts', () =>
        HttpResponse.json({ data: { recommendedProducts: [] } }),
      ),
    );

    render(
      <ApolloTestWrapper>
        <CartRecommendedProductSection />
      </ApolloTestWrapper>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cart-recommended-products')).not.toBeInTheDocument();
    });
  });
});
