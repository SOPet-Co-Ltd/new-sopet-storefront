import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReviewableItemCard } from './ReviewableItemCard';
import { sampleReviewableItem } from '@/test/mocks/fixtures/account';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

describe('ReviewableItemCard', () => {
  it('renders product info and write review CTA', () => {
    const onWriteReview = vi.fn();

    render(<ReviewableItemCard item={sampleReviewableItem} onWriteReview={onWriteReview} />);

    expect(screen.getByText(sampleReviewableItem.productName)).toBeInTheDocument();
    expect(screen.getByText(`คำสั่งซื้อ #${sampleReviewableItem.orderNumber}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เขียนรีวิว' })).toBeEnabled();
  });

  it('disables CTA when review deadline is in the past', () => {
    const expiredItem = {
      ...sampleReviewableItem,
      reviewDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    render(<ReviewableItemCard item={expiredItem} onWriteReview={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'เขียนรีวิว' })).toBeDisabled();
  });

  it('calls onWriteReview with the item when CTA is clicked', async () => {
    const user = userEvent.setup();
    const onWriteReview = vi.fn();

    render(<ReviewableItemCard item={sampleReviewableItem} onWriteReview={onWriteReview} />);
    await user.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));

    expect(onWriteReview).toHaveBeenCalledWith(sampleReviewableItem);
  });
});
