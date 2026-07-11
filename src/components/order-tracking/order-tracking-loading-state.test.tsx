import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderTrackingLoadingState } from './order-tracking-loading-state';

describe('OrderTrackingLoadingState', () => {
  it('announces loading with sr-only text and aria-busy on container', () => {
    render(<OrderTrackingLoadingState />);

    const container = screen.getByTestId('order-tracking-loading');
    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('กำลังโหลดข้อมูลคำสั่งซื้อ')).toHaveClass('sr-only');
    expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลดข้อมูลคำสั่งซื้อ');
  });
});
