import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SellerHeading } from './SellerHeading';
import type { StoreDetail } from '@/lib/hooks/useStore';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    onError,
    ...props
  }: {
    src: string;
    alt: string;
    onError?: () => void;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} onError={onError} {...props} />,
}));

const baseStore: StoreDetail = {
  id: 'store-1',
  name: 'SOPet Pet Shop',
  slug: 'sopet-pet-shop',
  logoUrl: 'https://example.com/logo.jpg',
  bannerUrl: 'https://example.com/banner.jpg',
  description: 'Your trusted pet shop',
  status: 'approved',
};

describe('SellerHeading', () => {
  it('renders banner above identity when store branding is available', () => {
    render(<SellerHeading store={baseStore} />);

    expect(screen.getByTestId('seller-heading-banner')).toHaveAttribute(
      'src',
      'https://example.com/banner.jpg',
    );
    expect(screen.getByTestId('seller-heading-logo').querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/logo.jpg',
    );
    expect(screen.getByRole('heading', { name: 'SOPet Pet Shop' })).toBeInTheDocument();
    expect(screen.getByText('Your trusted pet shop')).toBeInTheDocument();
  });

  it('hides banner and keeps identity when banner image fails to load', () => {
    render(<SellerHeading store={baseStore} />);

    fireEvent.error(screen.getByTestId('seller-heading-banner'));

    expect(screen.queryByTestId('seller-heading-banner')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SOPet Pet Shop' })).toBeInTheDocument();
    expect(screen.getByText('Your trusted pet shop')).toBeInTheDocument();
  });

  it('shows identity only when branding images are missing', () => {
    render(
      <SellerHeading
        store={{
          ...baseStore,
          logoUrl: null,
          bannerUrl: null,
        }}
      />,
    );

    expect(screen.queryByTestId('seller-heading-banner')).not.toBeInTheDocument();
    expect(screen.getByTestId('seller-heading-logo')).toHaveTextContent('S');
    expect(screen.getByRole('heading', { name: 'SOPet Pet Shop' })).toBeInTheDocument();
  });
});
