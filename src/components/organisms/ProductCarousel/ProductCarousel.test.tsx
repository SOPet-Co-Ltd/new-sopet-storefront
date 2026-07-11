import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductCarousel } from '@/components/organisms/ProductCarousel/ProductCarousel';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const slides = [
  {
    id: 'slide-1',
    imageUrl: 'https://example.com/image-1.jpg',
    isThumbnail: true,
    sortOrder: 0,
  },
  {
    id: 'slide-2',
    imageUrl: 'https://example.com/image-2.jpg',
    isThumbnail: false,
    sortOrder: 1,
  },
  {
    id: 'slide-3',
    imageUrl: 'https://example.com/image-3.jpg',
    isThumbnail: false,
    sortOrder: 2,
  },
];

describe('ProductCarousel', () => {
  it('renders a static hero image and thumbnail strip for multiple slides', () => {
    render(<ProductCarousel slides={slides} />);

    expect(screen.getByTestId('product-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('product-gallery-hero')).toBeInTheDocument();
    expect(screen.getByTestId('product-gallery-thumbnails')).toBeInTheDocument();

    const heroImage = screen.getByAltText('Product image');
    expect(heroImage).toHaveAttribute('src', 'https://example.com/image-1.jpg');
  });

  it('updates the hero image when a thumbnail is selected', async () => {
    const user = userEvent.setup();
    render(<ProductCarousel slides={slides} />);

    await user.click(screen.getByRole('button', { name: 'เลือกรูปที่ 2' }));

    const heroImage = screen.getByAltText('Product image');
    expect(heroImage).toHaveAttribute('src', 'https://example.com/image-2.jpg');
  });

  it('opens the lightbox when the hero image is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCarousel slides={slides} />);

    await user.click(screen.getByTestId('product-gallery-hero'));

    expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
    expect(screen.getAllByAltText('Product image')).toHaveLength(4);
  });

  it('renders carousel indicator for a single slide', () => {
    render(<ProductCarousel slides={[slides[0]]} />);

    expect(screen.getByTestId('product-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('product-gallery-thumbnails')).toBeInTheDocument();
    expect(screen.queryByTestId('product-gallery-trust-badges')).not.toBeInTheDocument();
  });

  it('renders thumbnail indicator when only thumbnailUrl is provided', () => {
    render(<ProductCarousel slides={[]} thumbnailUrl="https://example.com/thumbnail.jpg" />);

    expect(screen.getByTestId('product-gallery-hero')).toBeInTheDocument();
    expect(screen.getByTestId('product-gallery-thumbnails')).toBeInTheDocument();

    const heroImage = screen.getByAltText('Product image');
    expect(heroImage).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('renders empty state when no images are provided', () => {
    render(<ProductCarousel slides={[]} />);

    expect(screen.getByTestId('product-gallery-empty')).toBeInTheDocument();
  });
});
