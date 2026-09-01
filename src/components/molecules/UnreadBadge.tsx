'use client';

import { useQuery } from '@apollo/client/react';
import { UnreadCountDocument } from '@/lib/graphql/generated/graphql';

export function UnreadBadge() {
  const { data } = useQuery(UnreadCountDocument);
  const count = data?.unreadNotificationsCount ?? 0;

  if (count === 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sop-system-error-400 px-1 text-[10px] font-bold text-sop-base-white"
      data-testid="navbar-unread-badge"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
