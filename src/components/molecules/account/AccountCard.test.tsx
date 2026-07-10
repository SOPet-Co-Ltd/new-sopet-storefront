import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountCard } from './AccountCard';

describe('AccountCard', () => {
  it('renders default variant with sop token classes', () => {
    render(<AccountCard>Content</AccountCard>);

    const card = screen.getByTestId('account-card');
    expect(card).toHaveClass('rounded-sop-12px');
    expect(card).toHaveClass('border-sop-neutral-grayalpha-200');
    expect(card).toHaveClass('bg-sop-base-white');
    expect(card).toHaveClass('p-4');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders loading variant with aria-busy skeleton', () => {
    render(<AccountCard variant="loading" />);

    const card = screen.getByTestId('account-card-loading');
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(card).toHaveClass('animate-pulse');
  });

  it('renders error variant with error token classes', () => {
    render(<AccountCard variant="error">Error content</AccountCard>);

    const card = screen.getByTestId('account-card-error');
    expect(card).toHaveClass('border-sop-system-error-200');
    expect(card).toHaveClass('bg-sop-system-error-50');
  });
});
