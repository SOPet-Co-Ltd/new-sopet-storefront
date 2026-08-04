import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';

describe('EmptySearchResults', () => {
  it('renders analytics recovery chips linking to search results', async () => {
    render(<EmptySearchResults searchQuery="royal canun" />, {
      wrapper: createApolloTestWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('ลองค้นหา')).toBeInTheDocument();
    });

    const chip = screen.getByRole('link', { name: 'อาหารแมว' });
    expect(chip).toHaveAttribute(
      'href',
      '/search?q=%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%A1%E0%B8%A7',
    );
  });

  it('shows skeleton chips while recovery suggestions are fetching', () => {
    render(<EmptySearchResults searchQuery="royal canun" />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByTestId('search-recovery-chips-skeleton')).toBeInTheDocument();
  });

  it('shows the searched query in the empty state message', () => {
    render(<EmptySearchResults searchQuery="royal canun" />, {
      wrapper: createApolloTestWrapper(),
    });

    expect(screen.getByText(/เราไม่พบผลลัพธ์สำหรับ/)).toHaveTextContent('royal canun');
  });
});
