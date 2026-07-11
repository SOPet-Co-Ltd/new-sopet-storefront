import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrderTrackingErrorState } from './order-tracking-error-state';

describe('OrderTrackingErrorState', () => {
  it('renders locked Thai copy and invokes refetch on retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<OrderTrackingErrorState onRetry={onRetry} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'ไม่สามารถโหลดข้อมูลได้' }),
    ).toBeInTheDocument();
    expect(screen.getByText('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
