'use client';

import { useState } from 'react';
import { BellIcon } from '@/components/atoms/icons/inline';
import { cn } from '@/lib/utils';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/hooks/useNotifications';

const NOTIFICATION_TYPE_LABELS: Record<string, { label: string; status: string }> = {
  new_order: { label: 'ออเดอร์ใหม่', status: 'info' },
  order_status_changed: { label: 'ออเดอร์เปลี่ยนสถานะ', status: 'brand' },
  store_approved: { label: 'ร้านได้รับการอนุมัติ', status: 'success' },
  store_rejected: { label: 'ร้านถูกปฏิเสธ', status: 'danger' },
  store_request: { label: 'คำขอเปิดร้าน', status: 'warning' },
  new_reactivation_request: { label: 'คำขอเปิดใช้ร้านใหม่', status: 'warning' },
  payment_received: { label: 'ชำระเงินสำเร็จ', status: 'success' },
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-sop-base-gray-100 p-1 rounded-lg w-fit">
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              tab === 'all'
                ? 'bg-sop-base-white text-sop-base-black shadow-sm'
                : 'text-sop-base-gray-500 hover:text-sop-base-black',
            )}
            onClick={() => setTab('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              tab === 'unread'
                ? 'bg-sop-base-white text-sop-base-black shadow-sm'
                : 'text-sop-base-gray-500 hover:text-sop-base-black',
            )}
            onClick={() => setTab('unread')}
          >
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-danger text-white text-xs px-1.5">
                {unreadCount}
              </span>
            )}
          </button>
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
          <p className="text-sop-base-gray-500">กำลังโหลด...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-sop-base-gray-200 bg-sop-base-white p-12 flex flex-col items-center justify-center">
            <BellIcon size={{ mobile: 48, desktop: 48 }} color="#9E9EA8" />
            <p className="mt-4 text-sm text-sop-base-gray-500">
              {tab === 'unread' ? 'ไม่มีรายการที่ไม่ได้อ่าน' : 'ยังไม่มีแจ้งเตือน'}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={() => handleMarkRead(n.id)}
            />
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
  const typeInfo = NOTIFICATION_TYPE_LABELS[notification.type] ?? {
    label: notification.type,
    status: 'surface',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all cursor-pointer',
        notification.isRead
          ? 'border-sop-base-gray-200 bg-sop-base-white'
          : 'border-brand/30 bg-sop-base-white shadow-sm',
      )}
      onClick={onMarkRead}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onMarkRead();
      }}
      aria-label={`แจ้งเตือน: ${notification.title}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 h-2.5 w-2.5 rounded-full mt-1.5',
            notification.isRead ? 'bg-transparent' : 'bg-brand',
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-sop-base-black">{notification.title}</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-tint text-brand">
              {typeInfo.label}
            </span>
          </div>
          <p className="text-sm text-sop-base-gray-500">{notification.message}</p>
          <p className="text-xs text-sop-base-gray-400 mt-2">
            {new Date(notification.createdAt).toLocaleString('th-TH')}
          </p>
        </div>
      </div>
    </div>
  );
}
