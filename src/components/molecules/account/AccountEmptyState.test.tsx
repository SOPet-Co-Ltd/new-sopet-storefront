import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountEmptyState } from './AccountEmptyState';

describe('AccountEmptyState', () => {
  it('renders empty message with token typography', () => {
    render(<AccountEmptyState message="ยังไม่มีรายการ" />);

    const message = screen.getByText('ยังไม่มีรายการ');
    expect(message).toHaveClass('sop-body-sm-regular');
    expect(message).toHaveClass('text-sop-neutral-gray-400');
  });

  it('renders optional CTA link', () => {
    render(
      <AccountEmptyState
        cta={{ href: '/products', label: 'เลือกซื้อสินค้า' }}
        message="ยังไม่มีรายการ"
      />,
    );

    const link = screen.getByRole('link', { name: 'เลือกซื้อสินค้า' });
    expect(link).toHaveAttribute('href', '/products');
    expect(link).toHaveClass('text-sop-secondary-500');
  });
});
