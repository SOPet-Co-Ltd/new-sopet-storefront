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
  __typename: 'StoreType',
  id: 'store-1',
  name: 'SOPet Pet Shop',
  slug: 'sopet-pet-shop',
  logoUrl: null,
  bannerUrl: 'https://example.com/banner.jpg',
  description: 'Your trusted pet shop',
  status: 'approved',
};

describe('SellerHeading', () => {
  it('hides banner when image fails to load', () => {
    render(<SellerHeading store={baseStore} />);

    const banner = screen.getByAltText('SOPet Pet Shop');
    expect(banner).toBeInTheDocument();

    fireEvent.error(banner);

    expect(screen.queryByAltText('SOPet Pet Shop')).not.toBeInTheDocument();
    expect(screen.getByTestId('seller-heading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SOPet Pet Shop' })).toBeInTheDocument();
  });
});
