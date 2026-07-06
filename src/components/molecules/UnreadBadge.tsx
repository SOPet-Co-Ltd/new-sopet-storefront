'use client';

import { useQuery } from '@apollo/client/react';
import { UnreadCountDocument } from '@/lib/graphql/generated/graphql';

export function UnreadBadge() {
  const { data } = useQuery(UnreadCountDocument);
  const count = data?.unreadNotificationsCount ?? 0;

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
