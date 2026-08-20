import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductDescriptionContent } from '@/components/molecules/ProductMarkdownContent/ProductMarkdownContent';

describe('ProductDescriptionContent', () => {
  it('renders plain text as a markdown paragraph', () => {
    render(<ProductDescriptionContent description="Durable rubber chew toy for medium dogs." />);

    expect(screen.getByTestId('product-markdown-content')).toBeInTheDocument();
    expect(screen.getByText('Durable rubber chew toy for medium dogs.')).toBeInTheDocument();
  });

  it('renders markdown headings and lists', () => {
    render(
      <ProductDescriptionContent description={'## Features\n\n- Durable\n- **Safe** for dogs'} />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument();
    expect(screen.getByText('Durable')).toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });

  it('strips raw HTML markup from product descriptions', () => {
    render(
      <ProductDescriptionContent description="<p>Safe for <strong>medium</strong> dogs</p>" />,
    );

    expect(screen.getByTestId('product-markdown-content')).toBeInTheDocument();
    expect(screen.queryByRole('strong')).not.toBeInTheDocument();
    expect(screen.queryByText('medium')).not.toBeInTheDocument();
  });

  it('does not execute script tags in markdown source', () => {
    render(<ProductDescriptionContent description="<script>alert(1)</script><p>Safe</p>" />);

    expect(screen.queryByText('alert(1)')).not.toBeInTheDocument();
  });
});
