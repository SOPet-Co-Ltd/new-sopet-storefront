import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReviewImagesGrid } from './ReviewImagesGrid';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

const images = [
  { id: 'image-1', url: 'https://example.com/review-1.jpg' },
  { id: 'image-2', url: 'https://example.com/review-2.jpg' },
];

describe('ReviewImagesGrid', () => {
  it('renders nothing when there are no images', () => {
    const { container } = render(<ReviewImagesGrid images={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens the lightbox when a thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewImagesGrid images={images} />);

    await user.click(screen.getByRole('button', { name: 'ดูรูปรีวิวที่ 1' }));

    expect(screen.getByTestId('review-image-lightbox')).toBeInTheDocument();
    expect(screen.getByTestId('review-image-lightbox-image')).toHaveAttribute(
      'src',
      'https://example.com/review-1.jpg',
    );
  });

  it('closes the lightbox when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewImagesGrid images={images} />);

    await user.click(screen.getByRole('button', { name: 'ดูรูปรีวิวที่ 1' }));
    await user.click(screen.getByLabelText('Close lightbox'));

    expect(screen.queryByTestId('review-image-lightbox')).not.toBeInTheDocument();
  });

  it('navigates between images in the lightbox', async () => {
    const user = userEvent.setup();
    render(<ReviewImagesGrid images={images} />);

    await user.click(screen.getByRole('button', { name: 'ดูรูปรีวิวที่ 1' }));
    await user.click(screen.getByLabelText('Next image'));

    expect(screen.getByTestId('review-image-lightbox-image')).toHaveAttribute(
      'src',
      'https://example.com/review-2.jpg',
    );
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });
});
