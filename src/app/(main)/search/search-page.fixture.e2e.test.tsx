import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from '@/components/pages/SearchResultsPage';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleProductCard } from '@/test/mocks/fixtures/catalog';

// AC-005: Cold search results render matching products from initialProducts without skeleton.
// @category: fixture-e2e
// @lane: fixture-e2e

let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/search',
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

beforeEach(() => {
  searchParams = new URLSearchParams({ q: 'dog food' });
});

describe('Search page fixture-e2e', () => {
  it('renders matching search results from initialProducts without search skeleton', async () => {
    render(<SearchResultsPage initialProducts={[sampleProductCard]} />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(await screen.findByTestId('search-results-page')).toBeInTheDocument();
    expect(screen.getByText(sampleProductCard.name)).toBeInTheDocument();
    expect(screen.getByText('ผลการค้นหาทั้งหมด "dog food"')).toBeInTheDocument();
    expect(screen.queryByTestId('product-listing-skeleton')).not.toBeInTheDocument();
  });
});
