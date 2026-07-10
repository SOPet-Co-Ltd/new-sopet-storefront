import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, graphql } from 'msw';
import { describe, expect, it } from 'vitest';
import { SellerReviewTab } from './SellerReviewTab';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { server } from '@/test/mocks/server';
import {
  sampleStoreReview,
  sampleStoreReviewSummary,
  sampleStoreReviewWithReply,
} from '@/test/mocks/fixtures/catalog';

const STORE_ID = 'store-1';
const createWrapper = createApolloTestWrapper;

function renderSellerReviewTab() {
  return render(<SellerReviewTab storeId={STORE_ID} />, { wrapper: createWrapper() });
}

describe('SellerReviewTab', () => {
  it('renders seller score and individual reviews from storeReviews', async () => {
    server.use(
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({ data: { storeReviewSummary: sampleStoreReviewSummary } }),
      ),
      graphql.query('StoreReviews', () =>
        HttpResponse.json({ data: { storeReviews: [sampleStoreReview] } }),
      ),
    );

    renderSellerReviewTab();

    await waitFor(() => {
      expect(screen.getByText('4.6')).toBeInTheDocument();
    });
    expect(screen.getByText('คะแนนร้านค้า')).toBeInTheDocument();
    expect(screen.getByText('24 รีวิว')).toBeInTheDocument();
    expect(screen.getByText('รีวิวจากลูกค้า')).toBeInTheDocument();
    expect(screen.getByText(sampleStoreReview.productName)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: sampleStoreReview.productName })).toHaveAttribute(
      'href',
      `/product/${sampleStoreReview.productSlug}`,
    );
  });

  it('shows empty state when store has no reviews', async () => {
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

    renderSellerReviewTab();

    expect(await screen.findByText('ยังไม่มีรีวิว')).toBeInTheDocument();
  });

  it('shows retry when storeReviews fails', async () => {
    let requestCount = 0;
    server.use(
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({ data: { storeReviewSummary: sampleStoreReviewSummary } }),
      ),
      graphql.query('StoreReviews', () => {
        requestCount += 1;
        if (requestCount === 1) {
          return HttpResponse.json({ errors: [{ message: 'boom' }] });
        }
        return HttpResponse.json({ data: { storeReviews: [sampleStoreReview] } });
      }),
    );

    renderSellerReviewTab();

    expect(await screen.findByText('โหลดรีวิวไม่สำเร็จ')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ลองโหลดอีกครั้ง' }));
    expect(await screen.findByText(sampleStoreReview.productName)).toBeInTheDocument();
  });

  it('renders vendor reply in list item when present', async () => {
    server.use(
      graphql.query('StoreReviewSummary', () =>
        HttpResponse.json({ data: { storeReviewSummary: sampleStoreReviewSummary } }),
      ),
      graphql.query('StoreReviews', () =>
        HttpResponse.json({ data: { storeReviews: [sampleStoreReviewWithReply] } }),
      ),
    );

    renderSellerReviewTab();

    expect(await screen.findByTestId('vendor-reply-block')).toBeInTheDocument();
    expect(screen.getByText('Thank you for shopping with us')).toBeInTheDocument();
  });
});
