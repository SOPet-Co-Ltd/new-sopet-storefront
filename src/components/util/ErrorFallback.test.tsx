'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('renders Thai fallback copy and retries when requested', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorFallback onRetry={onRetry} />);

    expect(screen.getByRole('heading', { name: 'เกิดข้อผิดพลาด' })).toBeInTheDocument();
    expect(screen.getByText(/ไม่สามารถแสดงหน้านี้ได้/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองใหม่อีกครั้ง' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
