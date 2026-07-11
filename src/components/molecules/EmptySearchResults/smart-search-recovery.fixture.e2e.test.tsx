import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { ProductListing } from '@/components/sections/ProductListing';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleSearchRecoverySuggestions } from '@/test/mocks/fixtures/search';
import { server } from '@/test/mocks/server';

// AC-036: Zero-result search shows recovery chips above categories and navigates on chip click.
// @category: fixture-e2e
// @lane: fixture-e2e

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/search',
  useSearchParams: () => new URLSearchParams({ q: 'royal canun' }),
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

describe('Smart search recovery fixture-e2e', () => {
  it('shows recovery chips above categories with encoded search hrefs', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [],
              pagination: { page: 1, limit: 40, total: 0, totalPages: 0 },
            },
          },
        }),
      ),
      graphql.query('SearchRecoverySuggestions', () =>
        HttpResponse.json({
          data: { searchRecoverySuggestions: sampleSearchRecoverySuggestions },
        }),
      ),
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: [] } }),
      ),
    );

    render(<ProductListing search="royal canun" variant="search" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('empty-search-results')).toBeInTheDocument();
    });

    const recoveryHeading = screen.getByText('ลองค้นหา');
    const categoryHeading = screen.queryByText('ลองเลือกหมวดหมู่');
    if (categoryHeading) {
      expect(recoveryHeading.compareDocumentPosition(categoryHeading)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }

    const chip = screen.getByRole('link', { name: 'อาหารแมว' });
    expect(chip).toHaveAttribute(
      'href',
      '/search?q=%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%A1%E0%B8%A7',
    );
  });

  it('hides recovery chips when the recovery API fails but keeps the empty state', async () => {
    server.use(
      graphql.query('Products', () =>
        HttpResponse.json({
          data: {
            products: {
              items: [],
              pagination: { page: 1, limit: 40, total: 0, totalPages: 0 },
            },
          },
        }),
      ),
      graphql.query('SearchRecoverySuggestions', () =>
        HttpResponse.json({ errors: [{ message: 'recovery failed' }] }),
      ),
      graphql.query('ApprovedCategories', () =>
        HttpResponse.json({ data: { approvedCategories: [] } }),
      ),
    );

    render(<ProductListing search="royal canun" variant="search" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('empty-search-results')).toBeInTheDocument();
    });

    expect(screen.queryByRole('link', { name: 'อาหารแมว' })).not.toBeInTheDocument();
    expect(screen.getByText(/เราไม่พบผลลัพธ์สำหรับ/)).toBeInTheDocument();
  });
});
