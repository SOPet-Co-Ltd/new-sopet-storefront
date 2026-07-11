import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SellerStorefront } from '@/components/organisms/SellerTabs/SellerTabs';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleProductCard, sampleStore } from '@/test/mocks/fixtures/catalog';

// AC-007: Cold seller storefront renders identity and products without skeleton.
// @category: fixture-e2e
// @lane: fixture-e2e

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => `/sellers/${sampleStore.slug}`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Seller page fixture-e2e', () => {
  it('renders seller identity and first-page products from initial SSR props', () => {
    render(
      <SellerStorefront
        handle={sampleStore.slug}
        activeTab="products"
        initialStore={sampleStore}
        initialProducts={[sampleProductCard]}
      />,
      { wrapper: createApolloTestWrapper() },
    );

    expect(screen.getByText(sampleStore.name)).toBeInTheDocument();
    expect(screen.getByText(sampleProductCard.name)).toBeInTheDocument();
    expect(screen.queryByTestId('seller-storefront-skeleton')).not.toBeInTheDocument();
  });
});
