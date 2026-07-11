import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { SellerReviewTab } from '@/components/organisms/SellerReviewTab/SellerReviewTab';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CATALOG_PRODUCT_ID } from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

// AC-018–AC-020, AC-012/013: Seller tab public storeReviews journey with pagination + vendor replies.
// @category: fixture-e2e
// @lane: fixture-e2e

const STORE_ID = 'store-1';

function buildStoreReviews(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `store-review-${index + 1}`,
    productId: CATALOG_PRODUCT_ID,
    productName: `Product ${index + 1}`,
    productSlug: `product-${index + 1}`,
    productImageUrl: 'https://example.com/product.jpg',
    rating: 5,
    comment: `Review comment ${index + 1}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    customerName: `Customer ${index + 1}`,
    reply:
      index === 2
        ? {
            id: 'reply-1',
            body: 'Thank you for shopping with us',
            createdAt: '2026-01-02T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          }
        : null,
    images: [],
  }));
}

const createWrapper = createApolloTestWrapper;

describe('Seller reviews vendor reply fixture-e2e', () => {
  it('renders paginated store reviews with reply only on replied rows', async () => {
    const reviews = buildStoreReviews(11);

    server.use(
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({
          data: {
            storeReviewSummary: {
              averageRating: 4.8,
              totalCount: 11,
              productBreakdown: [],
            },
          },
        }),
      ),
      graphql.query('StoreReviews', () => HttpResponse.json({ data: { storeReviews: reviews } })),
    );

    const user = userEvent.setup();
    render(<SellerReviewTab storeId={STORE_ID} />, { wrapper: createWrapper() });

    expect(await screen.findByText('รีวิวจากลูกค้า')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('11 รีวิว')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 10')).toBeInTheDocument();
    expect(screen.queryByText('Product 11')).not.toBeInTheDocument();
    expect(screen.getByTestId('vendor-reply-block')).toBeInTheDocument();
    expect(screen.getByText('Thank you for shopping with us')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      expect(screen.getByText('Product 11')).toBeInTheDocument();
    });
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('vendor-reply-block')).not.toBeInTheDocument();
  });

  it('shows empty copy while keeping seller score when there are no reviews', async () => {
    server.use(
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({
          data: {
            storeReviewSummary: {
              averageRating: 0,
              totalCount: 0,
              productBreakdown: [],
            },
          },
        }),
      ),
      graphql.query('StoreReviews', () => HttpResponse.json({ data: { storeReviews: [] } })),
    );

    render(<SellerReviewTab storeId={STORE_ID} />, { wrapper: createWrapper() });

    expect(await screen.findByText('ยังไม่มีรีวิว')).toBeInTheDocument();
    expect(screen.getByText('คะแนนร้านค้า')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Product/ })).not.toBeInTheDocument();
  });
});
