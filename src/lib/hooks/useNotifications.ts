'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { NOTIFICATIONS_PAGE_SIZE } from '@/lib/constants/listPageSize';
import {
  NotificationsDocument,
  MarkNotificationReadDocument,
  MarkAllNotificationsReadDocument,
} from '@/lib/graphql/generated/graphql';

export type Notification = {
  id: string;
  type: string;
  title: string | null;
  message: string;
  metadata: string | null;
  isRead: boolean;
  createdAt: string;
};

export function useNotifications(unreadOnly = false, page = 1) {
  const limit = NOTIFICATIONS_PAGE_SIZE;
  const variables = { unreadOnly, page, limit };
  const { data, loading, error, refetch } = useQuery(NotificationsDocument, {
    variables,
    pollInterval: unreadOnly ? 15_000 : 0,
  });
  const notifications = (data?.notifications ?? []) as Notification[];
  return {
    notifications,
    loading,
    error,
    refetch,
    page,
    hasMore: notifications.length >= limit,
  };
}

export function useMarkNotificationRead() {
  return useMutation(MarkNotificationReadDocument, { refetchQueries: [NotificationsDocument] });
}

export function useMarkAllNotificationsRead() {
  return useMutation(MarkAllNotificationsReadDocument, { refetchQueries: [NotificationsDocument] });
}
