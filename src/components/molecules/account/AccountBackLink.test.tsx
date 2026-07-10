import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountBackLink } from './AccountBackLink';

describe('AccountBackLink', () => {
  it('renders a navigable back link', () => {
    render(<AccountBackLink href="/user/orders" label="กลับไปรายการคำสั่งซื้อ" />);

    expect(screen.getByRole('link', { name: 'กลับไปรายการคำสั่งซื้อ' })).toHaveAttribute(
      'href',
      '/user/orders',
    );
  });
});
