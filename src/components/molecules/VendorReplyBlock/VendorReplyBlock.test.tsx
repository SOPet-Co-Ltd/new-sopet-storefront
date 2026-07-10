import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VendorReplyBlock } from './VendorReplyBlock';

describe('VendorReplyBlock', () => {
  it('renders read-only vendor reply with accessibility region', () => {
    render(
      <VendorReplyBlock
        reply={{
          id: 'reply-1',
          body: 'Thank you',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByRole('region', { name: 'คำตอบจากผู้ขาย' })).toBeInTheDocument();
    expect(screen.getByText('คำตอบจากผู้ขาย')).toBeInTheDocument();
    expect(screen.getByText('Thank you')).toHaveClass('whitespace-pre-wrap');
  });
});
