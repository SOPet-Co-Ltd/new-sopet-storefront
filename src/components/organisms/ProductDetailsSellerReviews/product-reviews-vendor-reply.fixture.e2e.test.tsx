import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProductDetailsSellerReviews from '@/components/organisms/ProductDetailsSellerReviews/ProductDetailsSellerReviews';
import { sampleProductReview, sampleProductReviewWithReply } from '@/test/mocks/fixtures/catalog';

// AC-012–AC-014: PDP review filter + pagination keeps vendor reply nested under parent review.
// @category: fixture-e2e
// @lane: fixture-e2e

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/molecules/ReviewImagesGrid/ReviewImagesGrid', () => ({
  ReviewImagesGrid: () => null,
}));

describe('Product reviews vendor reply fixture-e2e', () => {
  it('keeps vendor reply paired after star filter and pagination', async () => {
    const reviews = Array.from({ length: 11 }, (_, index) => {
      const base = {
        ...sampleProductReview,
        id: `review-${index + 1}`,
        rating: 4,
        comment: `Comment from customer ${index + 1}`,
        customerName: `Customer ${index + 1}`,
        reply: null as typeof sampleProductReviewWithReply.reply,
      };

      if (index === 1) {
        return {
          ...base,
          reply: {
            id: 'reply-1',
            body: 'Reply for customer 2',
            createdAt: '2026-01-02T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        };
      }

      return base;
    });

    const user = userEvent.setup();
    render(
      <ProductDetailsSellerReviews
        productReviews={reviews}
        averageRating={4.5}
        totalReviews={11}
      />,
    );

    await user.click(screen.getByRole('button', { name: /4 ดาว/ }));

    const repliedArticle = screen.getByTestId('product-review-item-review-2');
    expect(repliedArticle).toContainElement(screen.getByTestId('vendor-reply-block'));
    expect(screen.getByText('Reply for customer 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));

    const pageTwoArticle = screen.getByTestId('product-review-item-review-11');
    expect(pageTwoArticle).toBeInTheDocument();
    expect(screen.queryByTestId('vendor-reply-block')).not.toBeInTheDocument();
  });

  it('omits vendor block when review has no reply', () => {
    render(
      <ProductDetailsSellerReviews
        productReviews={[sampleProductReview]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    expect(screen.queryByTestId('vendor-reply-block')).not.toBeInTheDocument();
    expect(screen.queryByText('คำตอบจากผู้ขาย')).not.toBeInTheDocument();
  });
});
