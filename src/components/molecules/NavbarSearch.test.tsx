import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NavbarSearch } from './NavbarSearch';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('NavbarSearch', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('navigates to /search with q param on submit', async () => {
    const user = userEvent.setup();

    render(<NavbarSearch />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาสินค้า' }), 'dog food');
    await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

    expect(push).toHaveBeenCalledWith('/search?q=dog%20food');
  });

  it('does not navigate when search input is empty', async () => {
    const user = userEvent.setup();

    render(<NavbarSearch />);

    await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

    expect(push).not.toHaveBeenCalled();
  });
});
