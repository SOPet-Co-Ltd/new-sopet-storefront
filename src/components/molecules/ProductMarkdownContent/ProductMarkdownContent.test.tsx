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

  it('renders sanitized HTML when markup is present', () => {
    render(
      <ProductDescriptionContent description="<p>Safe for <strong>medium</strong> dogs</p>" />,
    );

    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.queryByText('<strong>')).not.toBeInTheDocument();
  });
});
