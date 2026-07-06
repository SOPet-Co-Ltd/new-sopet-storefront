'use client';

import { useQuery, useMutation } from '@apollo/client/react';
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

export function useNotifications(unreadOnly = false) {
  const { data, loading, error, refetch } = useQuery(NotificationsDocument, {
    variables: { unreadOnly },
    pollInterval: unreadOnly ? 15_000 : 0,
  });
  return {
    notifications: (data?.notifications ?? []) as Notification[],
    loading,
    error,
    refetch,
  };
}

export function useMarkNotificationRead() {
  return useMutation(MarkNotificationReadDocument, { refetchQueries: [NotificationsDocument] });
}

export function useMarkAllNotificationsRead() {
  return useMutation(MarkAllNotificationsReadDocument, { refetchQueries: [NotificationsDocument] });
}
