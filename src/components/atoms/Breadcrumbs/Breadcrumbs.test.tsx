import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders nav landmark with lowercase breadcrumb aria-label and ordered list', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'หน้าแรก', path: '/' },
          { label: 'Dog Food', path: '/categories/dog-food' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav).toBeInTheDocument();
    expect(nav.querySelector('ol')).toBeInTheDocument();
  });

  it('renders ancestor items as links and current item as plain text with aria-current', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'หน้าแรก', path: '/' },
          { label: 'Dog Food', path: '/categories/dog-food' },
          { label: 'Premium Dog Food 5kg', path: '/product/prod-001' },
        ]}
      />,
    );

    const homeLink = screen.getByRole('link', { name: 'หน้าแรก' });
    expect(homeLink).toHaveAttribute('href', '/');

    const categoryLink = screen.getByRole('link', { name: 'Dog Food' });
    expect(categoryLink).toHaveAttribute('href', '/categories/dog-food');

    const currentItem = screen.getByText('Premium Dog Food 5kg');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem.tagName).toBe('SPAN');
    expect(screen.queryByRole('link', { name: 'Premium Dog Food 5kg' })).not.toBeInTheDocument();
  });

  it('marks separators as aria-hidden', () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: 'หน้าแรก', path: '/' },
          { label: 'Current page', path: '/current' },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    const separators = within(nav).getAllByText('>', { exact: true });

    expect(separators).toHaveLength(1);
    for (const separator of separators) {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    }

    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
  });

  it('keeps the trail on one line and truncates a long current label with title', () => {
    const longLabel =
      'Royal canin hepatic dog 6 kg อาหารสุนัข โรคตับ เพื่อลดการทำลายตับ ลดความเป็นพิษในตับ';

    const { container } = render(
      <Breadcrumbs
        items={[
          { label: 'หน้าแรก', path: '/' },
          { label: 'อาหารสัตว์', path: '/categories/pet-food' },
          { label: longLabel, path: '/product/prod-001' },
        ]}
      />,
    );

    const list = container.querySelector('ol');
    expect(list).toHaveClass('flex-nowrap');

    const items = container.querySelectorAll('ol > li');
    expect(items[0]).toHaveClass('shrink-0');
    expect(items[1]).toHaveClass('shrink-0');
    expect(items[2]).toHaveClass('min-w-0', 'flex-1', 'overflow-hidden');

    const currentItem = screen.getByText(longLabel);
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem).toHaveAttribute('title', longLabel);
    expect(currentItem).toHaveClass('truncate');
  });
});
