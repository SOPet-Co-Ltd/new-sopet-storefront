import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserNotificationsPage from './page';
import { useNotifications } from '@/lib/hooks/useNotifications';

const mockPush = vi.fn();
const mockMarkRead = vi.fn();

const mockNotifications = [
  {
    id: 'n-1',
    type: 'new_order',
    title: 'Order 1',
    message: 'New order received',
    metadata: null,
    isRead: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'n-2',
    type: 'store_rejected',
    title: 'Store rejected',
    message: 'Store was rejected',
    metadata: null,
    isRead: true,
    createdAt: '2025-01-02T00:00:00.000Z',
  },
];

vi.mock('@/lib/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    notifications: mockNotifications,
    loading: false,
    refetch: vi.fn(),
  })),
  useMarkNotificationRead: vi.fn(() => [mockMarkRead]),
  useMarkAllNotificationsRead: vi.fn(() => [vi.fn()]),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/notifications',
  useRouter: () => ({ push: mockPush }),
}));

describe('UserNotificationsPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockMarkRead.mockReset();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useNotifications>);
  });

  it('uses AccountTabBar for tabs', () => {
    render(<UserNotificationsPage />);

    expect(screen.getByRole('tablist', { name: 'แท็บการแจ้งเตือน' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'ทั้งหมด' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'ยังไม่อ่าน' })).toBeInTheDocument();
  });

  it('renders unread count badge with approved tokens', () => {
    render(<UserNotificationsPage />);

    const badge = screen.getByTestId('unread-count-badge');
    expect(badge).toHaveClass('bg-sop-system-error-400');
    expect(badge).toHaveClass('text-sop-base-white');
  });

  it('maps each notification type key to approved token classes', () => {
    render(<UserNotificationsPage />);

    expect(screen.getByTestId('notification-type-badge-new_order')).toHaveClass(
      'bg-sop-primary-100',
      'text-sop-primary-600',
    );
    expect(screen.getByTestId('notification-type-badge-store_rejected')).toHaveClass(
      'bg-sop-system-error-100',
      'text-sop-system-error-500',
    );
  });

  it('does not use legacy banned token classes', () => {
    const { container } = render(<UserNotificationsPage />);
    const html = container.innerHTML;

    expect(html).not.toMatch(/bg-brand/);
    expect(html).not.toMatch(/bg-danger/);
    expect(html).not.toMatch(/sop-base-gray/);
  });

  it('opens the order detail page when a payment_received card is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [
        {
          id: 'n-pay',
          type: 'payment_received',
          title: 'ชำระเงินสำเร็จสำหรับออเดอร์ #ORD-TEST',
          message: 'ชำระเงินสำเร็จสำหรับออเดอร์ #ORD-TEST',
          metadata: JSON.stringify({ orderId: 'order-123' }),
          isRead: false,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<UserNotificationsPage />);

    expect(screen.getByTestId('notification-order-link-payment_received')).toHaveAttribute(
      'href',
      '/user/orders/order-123',
    );

    await user.click(screen.getByRole('button', { name: /ชำระเงินสำเร็จสำหรับออเดอร์/ }));

    expect(mockMarkRead).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/user/orders/order-123');
  });
});
