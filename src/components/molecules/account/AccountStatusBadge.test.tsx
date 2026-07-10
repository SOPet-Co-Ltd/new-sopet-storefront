import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountStatusBadge } from './AccountStatusBadge';

describe('AccountStatusBadge', () => {
  it('renders default variant with primary tokens', () => {
    render(<AccountStatusBadge>กำลังดำเนินการ</AccountStatusBadge>);

    const badge = screen.getByTestId('account-status-badge');
    expect(badge).toHaveClass('rounded-sop-8px');
    expect(badge).toHaveClass('bg-sop-primary-100');
    expect(badge).toHaveClass('text-sop-primary-600');
    expect(badge).toHaveClass('sop-body-xs-medium');
  });

  it('renders error variant with error tokens', () => {
    render(<AccountStatusBadge variant="error">ยกเลิกแล้ว</AccountStatusBadge>);

    const badge = screen.getByTestId('account-status-badge');
    expect(badge).toHaveClass('bg-sop-system-error-100');
    expect(badge).toHaveClass('text-sop-system-error-500');
  });
});
