import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WrittenReviewCard } from './WrittenReviewCard';
import { sampleMyReview } from '@/test/mocks/fixtures/account';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

describe('WrittenReviewCard', () => {
  it('renders product name, rating, comment, and product link', () => {
    render(<WrittenReviewCard review={sampleMyReview} />);

    expect(screen.getByText(sampleMyReview.productName)).toBeInTheDocument();
    expect(screen.getByText(sampleMyReview.comment!)).toBeInTheDocument();
    expect(screen.getByLabelText(`${sampleMyReview.rating} จาก 5 ดาว`)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: sampleMyReview.productName })).toHaveLength(2);
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', `/product/${sampleMyReview.productId}`);
    expect(screen.getByTestId('review-images-grid')).toBeInTheDocument();
  });
});
