import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { NavbarSearch } from './NavbarSearch';

const push = vi.fn();
const renderNavbarSearch = () => render(<NavbarSearch />, { wrapper: createApolloTestWrapper() });

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('NavbarSearch', () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();
  });

  it('navigates to /search with q param on submit', async () => {
    const user = userEvent.setup();

    renderNavbarSearch();

    await user.type(screen.getByRole('combobox', { name: 'ค้นหาสินค้า' }), 'dog food');
    await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

    expect(push).toHaveBeenCalledWith('/search?q=dog%20food');
  });

  it('does not navigate when search input is empty', async () => {
    const user = userEvent.setup();

    renderNavbarSearch();

    await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

    expect(push).not.toHaveBeenCalled();
  });

  it('opens recent searches on empty focus when history exists', async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem('sopet_recent_searches', JSON.stringify(['cat food']));

    renderNavbarSearch();

    await user.click(screen.getByRole('combobox', { name: 'ค้นหาสินค้า' }));

    expect(screen.getByTestId('search-suggestions-dropdown')).toBeInTheDocument();
    expect(screen.getByText('ค้นหาล่าสุด')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'cat food' }));
    expect(push).toHaveBeenCalledWith('/search?q=cat%20food');
  });

  it('does not open dropdown on empty focus when there is no search history', async () => {
    const user = userEvent.setup();

    renderNavbarSearch();

    await user.click(screen.getByRole('combobox', { name: 'ค้นหาสินค้า' }));

    expect(screen.queryByTestId('search-suggestions-dropdown')).not.toBeInTheDocument();
  });

  it('shows product suggestions after typing at least 2 characters', async () => {
    const user = userEvent.setup();

    renderNavbarSearch();

    const input = screen.getByRole('combobox', { name: 'ค้นหาสินค้า' });
    await user.click(input);
    await user.type(input, 'ro');

    await waitFor(
      () => {
        expect(screen.getByText('Royal Canin Cat Food')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('navigates to product page when selecting a product suggestion with keyboard', async () => {
    const user = userEvent.setup();

    renderNavbarSearch();

    const input = screen.getByRole('combobox', { name: 'ค้นหาสินค้า' });
    await user.click(input);
    await user.type(input, 'ro');

    await waitFor(
      () => {
        expect(screen.getByText('Royal Canin Cat Food')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await user.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/product/prod-royal-canin');
    });
  });
});
