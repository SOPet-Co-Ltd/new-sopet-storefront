import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OrderPaymentCountdown,
  UNPAID_ORDER_CANCEL_AFTER_MS,
  formatHoursCountdown,
  getPaymentDeadlineIso,
} from './OrderPaymentCountdown';

describe('formatHoursCountdown', () => {
  it('formats remaining time as HH:MM:SS', () => {
    expect(formatHoursCountdown(23 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000)).toBe('23:59:59');
    expect(formatHoursCountdown(5 * 60 * 1000)).toBe('00:05:00');
    expect(formatHoursCountdown(0)).toBe('00:00:00');
  });
});

describe('getPaymentDeadlineIso', () => {
  it('returns createdAt plus 24 hours', () => {
    expect(getPaymentDeadlineIso('2025-01-01T00:00:00.000Z')).toBe('2025-01-02T00:00:00.000Z');
  });

  it('returns null for an invalid date', () => {
    expect(getPaymentDeadlineIso('not-a-date')).toBeNull();
  });
});

describe('OrderPaymentCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows remaining time until the 24h payment deadline', () => {
    const now = new Date('2025-01-01T12:00:00.000Z');
    vi.setSystemTime(now);
    const createdAt = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();

    render(<OrderPaymentCountdown createdAt={createdAt} />);

    expect(screen.getByTestId('order-payment-countdown')).toHaveTextContent('22:00:00');
    expect(screen.getByTestId('order-payment-countdown')).toHaveTextContent(
      'มิฉะนั้นคำสั่งซื้อจะถูกยกเลิกอัตโนมัติ',
    );
  });

  it('ticks down every second', () => {
    const now = new Date('2025-01-01T12:00:00.000Z');
    vi.setSystemTime(now);
    const createdAt = now.toISOString();

    render(<OrderPaymentCountdown createdAt={createdAt} />);

    expect(screen.getByTestId('order-payment-countdown')).toHaveTextContent('24:00:00');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('order-payment-countdown')).toHaveTextContent('23:59:59');
  });

  it('shows expired message once the deadline has passed', () => {
    const now = new Date('2025-01-02T12:00:00.000Z');
    vi.setSystemTime(now);
    const createdAt = new Date(now.getTime() - UNPAID_ORDER_CANCEL_AFTER_MS - 1000).toISOString();

    render(<OrderPaymentCountdown createdAt={createdAt} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'หมดเวลาชำระเงิน คำสั่งซื้อนี้จะถูกยกเลิกอัตโนมัติ',
    );
  });

  it('uses smaller spacing and typography in compact mode', () => {
    const now = new Date('2025-01-01T12:00:00.000Z');
    vi.setSystemTime(now);

    render(<OrderPaymentCountdown createdAt={now.toISOString()} compact />);

    const banner = screen.getByTestId('order-payment-countdown');
    expect(banner).toHaveClass('px-3', 'py-1.5');
    expect(banner.querySelector('p')).toHaveClass('sop-body-xs-regular');
  });

  it('renders nothing for an invalid createdAt', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));

    render(<OrderPaymentCountdown createdAt="not-a-date" />);

    expect(screen.queryByTestId('order-payment-countdown')).not.toBeInTheDocument();
  });
});
