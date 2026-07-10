import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UserFavoritesPage from './page';

vi.mock('@/lib/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/favorites',
}));

import { useFavorites } from '@/lib/hooks/useFavorites';

const mockedUseFavorites = vi.mocked(useFavorites);

describe('UserFavoritesPage', () => {
  it('renders unified page title', () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      loading: false,
      removeFavorite: vi.fn(),
    } as ReturnType<typeof useFavorites>);

    render(<UserFavoritesPage />);

    expect(screen.getByRole('heading', { name: 'รายการโปรด' })).toBeInTheDocument();
  });

  it('renders AccountEmptyState with shop CTA when favorites are empty', () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      loading: false,
      removeFavorite: vi.fn(),
    } as ReturnType<typeof useFavorites>);

    render(<UserFavoritesPage />);

    expect(screen.getByTestId('account-empty-state')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ไปเลือกซื้อสินค้า' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders FavoritesGrid when favorites exist', () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [
        {
          id: 'fav-1',
          productId: 'prod-1',
          product: {
            id: 'prod-1',
            name: 'Dog Food',
            basePrice: 299,
            thumbnailUrl: null,
            images: [],
          },
        },
      ],
      loading: false,
      removeFavorite: vi.fn(),
    } as ReturnType<typeof useFavorites>);

    render(<UserFavoritesPage />);

    expect(screen.getByText('Dog Food')).toBeInTheDocument();
    expect(screen.queryByTestId('account-empty-state')).not.toBeInTheDocument();
  });
});
