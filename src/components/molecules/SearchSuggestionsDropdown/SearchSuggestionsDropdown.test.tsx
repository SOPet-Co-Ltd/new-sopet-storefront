import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('SearchSuggestionsDropdown', () => {
  it('shows recent searches when query is empty', async () => {
    const user = userEvent.setup();
    const onRecentSelect = vi.fn();

    render(
      <SearchSuggestionsDropdown
        open
        query=""
        listboxId="listbox"
        recentQueries={['cat food']}
        options={[]}
        activeIndex={-1}
        loading={false}
        onSelect={vi.fn()}
        onRecentSelect={onRecentSelect}
        onClearRecent={vi.fn()}
      />,
    );

    expect(screen.getByText('ค้นหาล่าสุด')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'cat food' }));
    expect(onRecentSelect).toHaveBeenCalledWith('cat food');
  });

  it('does not render when query is empty and there is no history', () => {
    render(
      <SearchSuggestionsDropdown
        open
        query=""
        listboxId="listbox"
        recentQueries={[]}
        options={[]}
        activeIndex={-1}
        loading={false}
        onSelect={vi.fn()}
        onRecentSelect={vi.fn()}
        onClearRecent={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('search-suggestions-dropdown')).not.toBeInTheDocument();
  });

  it('renders product suggestions with thumbnail images', () => {
    render(
      <SearchSuggestionsDropdown
        open
        query="ro"
        listboxId="listbox"
        recentQueries={[]}
        options={[
          {
            type: 'product',
            id: 'prod-1',
            label: 'Royal Canin Cat Food',
            href: '/product/prod-1',
            thumbnailUrl: 'https://example.com/royal-canin.jpg',
          },
        ]}
        activeIndex={0}
        loading={false}
        onSelect={vi.fn()}
        onRecentSelect={vi.fn()}
        onClearRecent={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Royal Canin Cat Food' })).toBeInTheDocument();
    expect(document.querySelector('img')?.getAttribute('src')).toContain('royal-canin.jpg');
  });
});
