import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProductDetailsSellerReviews from './ProductDetailsSellerReviews';
import {
  sampleProductReview,
  sampleProductReviewWithImages,
  sampleProductReviewWithReply,
} from '@/test/mocks/fixtures/catalog';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/molecules/ReviewImagesGrid/ReviewImagesGrid', () => ({
  ReviewImagesGrid: ({ images }: { images: Array<{ id: string }> }) => (
    <div data-testid="review-images-grid">{images.length}</div>
  ),
}));

describe('ProductDetailsSellerReviews', () => {
  it('renders vendor reply inside the same review article', () => {
    render(
      <ProductDetailsSellerReviews
        productReviews={[sampleProductReviewWithReply]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    const article = screen.getByTestId(`product-review-item-${sampleProductReviewWithReply.id}`);
    expect(article).toContainElement(screen.getByTestId('vendor-reply-block'));
    expect(screen.getByText('Thank you for your review')).toBeInTheDocument();
  });

  it('does not render vendor reply block when reply is null', () => {
    render(
      <ProductDetailsSellerReviews
        productReviews={[sampleProductReview]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    expect(screen.queryByTestId('vendor-reply-block')).not.toBeInTheDocument();
  });

  it('keeps reply paired with review after filter change', async () => {
    const reviews = [
      { ...sampleProductReview, id: 'review-a', rating: 3, comment: 'OK' },
      { ...sampleProductReviewWithReply, id: 'review-b', rating: 5, comment: 'Excellent' },
    ];

    render(
      <ProductDetailsSellerReviews productReviews={reviews} averageRating={4} totalReviews={2} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /5 ดาว/ }));

    const article = screen.getByTestId('product-review-item-review-b');
    expect(article).toContainElement(screen.getByTestId('vendor-reply-block'));
    expect(screen.queryByTestId('product-review-item-review-a')).not.toBeInTheDocument();
  });

  it('filters reviews with comments only', async () => {
    const reviews = [
      { ...sampleProductReview, id: 'review-no-comment', comment: null },
      { ...sampleProductReview, id: 'review-with-comment', comment: 'Great product' },
    ];

    render(
      <ProductDetailsSellerReviews productReviews={reviews} averageRating={5} totalReviews={2} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'เฉพาะความคิดเห็น' }));

    expect(screen.getByTestId('product-review-item-review-with-comment')).toBeInTheDocument();
    expect(screen.queryByTestId('product-review-item-review-no-comment')).not.toBeInTheDocument();
  });

  it('filters reviews with images only', async () => {
    const reviews = [
      { ...sampleProductReview, id: 'review-no-images', images: [] },
      sampleProductReviewWithImages,
    ];

    render(
      <ProductDetailsSellerReviews productReviews={reviews} averageRating={5} totalReviews={2} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'มีรูปภาพ' }));

    expect(screen.getByTestId(`product-review-item-${sampleProductReviewWithImages.id}`)).toBeInTheDocument();
    expect(screen.queryByTestId('product-review-item-review-no-images')).not.toBeInTheDocument();
  });
});
