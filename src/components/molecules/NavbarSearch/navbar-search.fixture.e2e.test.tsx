import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavbarSearch } from '@/components/molecules/NavbarSearch';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';

// AC-024–AC-026, P1 recent searches: navbar combobox multi-step journeys.
// @category: fixture-e2e
// @lane: fixture-e2e

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

beforeEach(() => {
  push.mockClear();
  window.sessionStorage.clear();
});

describe('Navbar search fixture-e2e', () => {
  it('opens recent searches on empty focus and navigates to search', async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem('sopet_recent_searches', JSON.stringify(['cat food']));

    render(<NavbarSearch />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('combobox', { name: 'ค้นหาสินค้า' }));
    expect(screen.getByTestId('search-suggestions-dropdown')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'cat food' }));

    expect(push).toHaveBeenCalledWith('/search?q=cat%20food');
  });

  it('selects a product suggestion with keyboard and saves recent search', async () => {
    const user = userEvent.setup();

    render(<NavbarSearch />, { wrapper: createWrapper() });

    const input = screen.getByRole('combobox', { name: 'ค้นหาสินค้า' });
    await user.click(input);
    await user.type(input, 'ro');

    await waitFor(() => {
      expect(screen.getByText('Royal Canin Cat Food')).toBeInTheDocument();
    });

    await user.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/product/prod-royal-canin');
    });

    const stored = JSON.parse(window.sessionStorage.getItem('sopet_recent_searches') ?? '[]');
    expect(stored).toContain('ro');
  });

  it('closes the dropdown on Escape', async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem('sopet_recent_searches', JSON.stringify(['dog food']));

    render(<NavbarSearch />, { wrapper: createWrapper() });

    const input = screen.getByRole('combobox', { name: 'ค้นหาสินค้า' });
    await user.click(input);
    expect(screen.getByTestId('search-suggestions-dropdown')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('search-suggestions-dropdown')).not.toBeInTheDocument();
  });
});
