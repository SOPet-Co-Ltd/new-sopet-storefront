'use client';

import { useState } from 'react';
import { BellIcon } from '@/components/atoms/icons/inline';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { AccountTabBar } from '@/components/molecules/account/AccountTabBar';
import { cn } from '@/lib/utils';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/hooks/useNotifications';

type NotificationTypeConfig = {
  label: string;
  badgeClasses: string;
};

export const NOTIFICATION_TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  new_order: {
    label: 'ออเดอร์ใหม่',
    badgeClasses: 'bg-sop-primary-100 text-sop-primary-600',
  },
  order_status_changed: {
    label: 'ออเดอร์เปลี่ยนสถานะ',
    badgeClasses: 'bg-sop-primary-100 text-sop-primary-600',
  },
  store_approved: {
    label: 'ร้านได้รับการอนุมัติ',
    badgeClasses: 'bg-sop-system-success-100 text-sop-system-success-500',
  },
  store_rejected: {
    label: 'ร้านถูกปฏิเสธ',
    badgeClasses: 'bg-sop-system-error-100 text-sop-system-error-500',
  },
  store_request: {
    label: 'คำขอเปิดร้าน',
    badgeClasses: 'bg-sop-system-warning-100 text-sop-system-warning-500',
  },
  new_reactivation_request: {
    label: 'คำขอเปิดใช้ร้านใหม่',
    badgeClasses: 'bg-sop-system-warning-100 text-sop-system-warning-500',
  },
  payment_received: {
    label: 'ชำระเงินสำเร็จ',
    badgeClasses: 'bg-sop-system-success-100 text-sop-system-success-500',
  },
};

const DEFAULT_NOTIFICATION_TYPE_CONFIG: NotificationTypeConfig = {
  label: '',
  badgeClasses: 'bg-sop-neutral-gray-500 text-sop-neutral-gray-300',
};

export default function UserNotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { notifications, loading, refetch } = useNotifications(tab === 'unread');
  const [markRead] = useMarkNotificationRead();
  const [markAll] = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await markRead({ variables: { id } });
  };

  const handleMarkAllRead = async () => {
    await markAll();
    refetch();
  };

  return (
    <AccountLayout title="การแจ้งเตือน">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AccountTabBar
            ariaLabel="แท็บการแจ้งเตือน"
            onValueChange={(value) => setTab(value as 'all' | 'unread')}
            tabs={[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'unread', label: 'ยังไม่อ่าน' },
            ]}
            value={tab}
          />
          {unreadCount > 0 ? (
            <span
              className="inline-flex items-center justify-center rounded-full bg-sop-system-error-400 px-1.5 text-xs text-sop-base-white"
              data-testid="unread-count-badge"
            >
              {unreadCount}
            </span>
          ) : null}
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="sop-body-sm-medium text-sop-secondary-500 underline"
          >
            อ่านทั้งหมด
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : notifications.length === 0 ? (
          <AccountCard padding="lg">
            <AccountEmptyState
              icon={<BellIcon size={{ mobile: 48, desktop: 48 }} color="#9E9EA8" />}
              message={tab === 'unread' ? 'ไม่มีรายการที่ไม่ได้อ่าน' : 'ยังไม่มีแจ้งเตือน'}
            />
          </AccountCard>
        ) : (
          notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={() => handleMarkRead(n.id)} />
          ))
        )}
      </div>
    </AccountLayout>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: {
    id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: string | null;
    isRead: boolean;
    createdAt: string;
  };
  onMarkRead: () => void;
}) {
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type] ?? {
    ...DEFAULT_NOTIFICATION_TYPE_CONFIG,
    label: notification.type,
  };

  const handleActivate = () => {
    onMarkRead();
  };

  return (
    <div
      className={cn(
        'cursor-pointer transition-all',
        !notification.isRead &&
          '[&_[data-testid=account-card]]:border-sop-primary-300 [&_[data-testid=account-card]]:shadow-sm',
      )}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleActivate();
      }}
      role="button"
      tabIndex={0}
      aria-label={`แจ้งเตือน: ${notification.title}`}
    >
      <AccountCard>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
              notification.isRead ? 'bg-transparent' : 'bg-sop-primary-500',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="sop-body-sm-medium text-sop-neutral-gray-200">{notification.title}</p>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 sop-body-xs-medium',
                  typeConfig.badgeClasses,
                )}
                data-testid={`notification-type-badge-${notification.type}`}
              >
                {typeConfig.label}
              </span>
            </div>
            <p className="sop-body-sm-regular text-sop-neutral-gray-400">{notification.message}</p>
            <p className="mt-2 sop-body-xs-regular text-sop-neutral-gray-400">
              {formatThaiDateTime(notification.createdAt)}
            </p>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}
