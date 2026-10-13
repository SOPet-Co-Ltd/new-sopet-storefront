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

  it('renders images, quotes, and dividers from markdown', () => {
    render(
      <ProductDescriptionContent
        description={'> Soft chew\n\n---\n\n![Chew toy](https://cdn.example.com/products/toy.webp)'}
      />,
    );

    expect(screen.getByText('Soft chew')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    const image = screen.getByRole('img', { name: 'Chew toy' });
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/products/toy.webp');
    expect(image).toHaveClass('h-auto', 'w-full', 'rounded-lg');
    expect(image).not.toHaveClass('aspect-square', 'object-cover');
  });

  it('lays out consecutive description images in a responsive grid', () => {
    render(
      <ProductDescriptionContent
        description={
          '![One](https://cdn.example.com/products/one.webp)\n\n![Two](https://cdn.example.com/products/two.webp)'
        }
      />,
    );

    expect(screen.getByTestId('product-markdown-content')).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
    );
    expect(screen.getByRole('img', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Two' })).toBeInTheDocument();
  });

  it('renders http and https images from markdown', () => {
    const { rerender } = render(
      <ProductDescriptionContent
        description={'![Local](http://localhost:9000/products/toy.webp)'}
      />,
    );

    expect(screen.getByRole('img', { name: 'Local' })).toHaveAttribute(
      'src',
      'http://localhost:9000/products/toy.webp',
    );

    rerender(
      <ProductDescriptionContent
        description={'![Cdn](https://cdn.example.com/products/toy.webp)'}
      />,
    );

    expect(screen.getByRole('img', { name: 'Cdn' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/products/toy.webp',
    );
  });

  it('omits non-http(s) image sources', () => {
    render(<ProductDescriptionContent description={'![Bad](javascript:alert(1))'} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
