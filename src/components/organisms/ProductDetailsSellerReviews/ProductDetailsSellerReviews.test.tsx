import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProductDetailsSellerReviews from './ProductDetailsSellerReviews';
import { RANDOM_THAI_NAMES, getReviewerName } from './ProductReviewItem';
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

    await userEvent.click(screen.getByRole('button', { name: /ความคิดเห็น/ }));

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

    await userEvent.click(screen.getByRole('button', { name: /มีรูปภาพ/ }));

    expect(
      screen.getByTestId(`product-review-item-${sampleProductReviewWithImages.id}`),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('product-review-item-review-no-images')).not.toBeInTheDocument();
  });

  it('shows 4 reviews initially and appends 10 more when clicking load more', async () => {
    const reviews = Array.from({ length: 15 }, (_, index) => ({
      ...sampleProductReview,
      id: `review-page-${index + 1}`,
      comment: `Review ${index + 1}`,
    }));

    render(
      <ProductDetailsSellerReviews productReviews={reviews} averageRating={5} totalReviews={15} />,
    );

    expect(screen.getByTestId('product-review-item-review-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-review-item-review-page-4')).toBeInTheDocument();
    expect(screen.queryByTestId('product-review-item-review-page-5')).not.toBeInTheDocument();

    const loadMoreButton = screen.getByRole('button', { name: /ดูรีวิวเพิ่มเติม \(11\)/ });
    expect(loadMoreButton).toBeInTheDocument();

    await userEvent.click(loadMoreButton);

    expect(screen.getByTestId('product-review-item-review-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-review-item-review-page-14')).toBeInTheDocument();
    expect(screen.queryByTestId('product-review-item-review-page-15')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ดูรีวิวเพิ่มเติม \(1\)/ })).toBeInTheDocument();
  });

  it('renders variant options when present and omits when not present', () => {
    const reviews = [
      {
        ...sampleProductReview,
        id: 'review-with-variant',
        variantOptions: '20-40 kg',
      },
      {
        ...sampleProductReview,
        id: 'review-without-variant',
        variantOptions: null,
      },
    ];

    render(
      <ProductDetailsSellerReviews productReviews={reviews} averageRating={5} totalReviews={2} />,
    );

    expect(screen.getByText('ตัวเลือก : 20-40 kg')).toBeInTheDocument();
    const noVariantArticle = screen.getByTestId('product-review-item-review-without-variant');
    expect(noVariantArticle).not.toHaveTextContent('ตัวเลือก : 20-40 kg');
  });

  it('renders reviewer avatar image when customerProfilePhotoUrl is provided', () => {
    const reviewWithPhoto = {
      ...sampleProductReview,
      id: 'review-with-photo',
      customerName: 'Somchai P.',
      customerProfilePhotoUrl: 'https://cdn.example.com/profiles/somchai.jpg',
    };

    render(
      <ProductDetailsSellerReviews
        productReviews={[reviewWithPhoto]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    const avatarImg = screen.getByTestId('reviewer-avatar-image');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://cdn.example.com/profiles/somchai.jpg');
    expect(avatarImg).toHaveAttribute('alt', 'Somchai P.');
    expect(screen.queryByTestId('reviewer-avatar-placeholder')).not.toBeInTheDocument();
  });

  it('renders avatar placeholder initials when customerProfilePhotoUrl is null', () => {
    const reviewWithoutPhoto = {
      ...sampleProductReview,
      id: 'review-without-photo',
      customerName: 'Anan K.',
      customerProfilePhotoUrl: null,
    };

    render(
      <ProductDetailsSellerReviews
        productReviews={[reviewWithoutPhoto]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    expect(screen.queryByTestId('reviewer-avatar-image')).not.toBeInTheDocument();
    const placeholder = screen.getByTestId('reviewer-avatar-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('A');
  });

  it('falls back to avatar placeholder initials when image loading fails', () => {
    const reviewWithBrokenPhoto = {
      ...sampleProductReview,
      id: 'review-with-broken-photo',
      customerName: 'Karn B.',
      customerProfilePhotoUrl: 'https://cdn.example.com/broken.jpg',
    };

    render(
      <ProductDetailsSellerReviews
        productReviews={[reviewWithBrokenPhoto]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    const avatarImg = screen.getByTestId('reviewer-avatar-image');
    expect(avatarImg).toBeInTheDocument();

    fireEvent.error(avatarImg);

    expect(screen.queryByTestId('reviewer-avatar-image')).not.toBeInTheDocument();
    const placeholder = screen.getByTestId('reviewer-avatar-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('K');
  });

  it('generates a random Thai name when reviewer has no name or generic name', () => {
    const reviewWithoutName = {
      ...sampleProductReview,
      id: 'review-no-name-1',
      customerName: '',
      customerProfilePhotoUrl: null,
    };
    const reviewGenericName = {
      ...sampleProductReview,
      id: 'review-generic-name-2',
      customerName: 'ลูกค้า',
      customerProfilePhotoUrl: null,
    };

    render(
      <ProductDetailsSellerReviews
        productReviews={[reviewWithoutName, reviewGenericName]}
        averageRating={5}
        totalReviews={2}
      />,
    );

    const expectedName1 = getReviewerName(reviewWithoutName);
    const expectedName2 = getReviewerName(reviewGenericName);

    expect(RANDOM_THAI_NAMES).toContain(expectedName1);
    expect(RANDOM_THAI_NAMES).toContain(expectedName2);

    expect(screen.getByText(expectedName1)).toBeInTheDocument();
    expect(screen.getByText(expectedName2)).toBeInTheDocument();

    // Verify avatar placeholder displays the first character of the generated Thai name
    const article1 = screen.getByTestId('product-review-item-review-no-name-1');
    const placeholder1 = article1.querySelector('[data-testid="reviewer-avatar-placeholder"]');
    expect(placeholder1).toHaveTextContent(expectedName1.charAt(0));
  });

  it('keeps real reviewer name when customer has a name', () => {
    const reviewWithRealName = {
      ...sampleProductReview,
      id: 'review-real-name',
      customerName: 'ธนากร ส.',
      customerProfilePhotoUrl: null,
    };

    render(
      <ProductDetailsSellerReviews
        productReviews={[reviewWithRealName]}
        averageRating={5}
        totalReviews={1}
      />,
    );

    expect(screen.getByText('ธนากร ส.')).toBeInTheDocument();
  });
});
