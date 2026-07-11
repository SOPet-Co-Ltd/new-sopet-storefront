import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductListing } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleProductCard } from '@/test/mocks/fixtures/catalog';

// AC-004: Category PLP renders page-1 products from initialProducts without skeleton.
// @category: integration
// @lane: integration

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/categories/dog-food',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Category page integration', () => {
  it('renders page-1 products from initialProducts without skeleton', () => {
    render(<ProductListing category="dog-food" initialProducts={[sampleProductCard]} />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByText(sampleProductCard.name)).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();
  });
});
