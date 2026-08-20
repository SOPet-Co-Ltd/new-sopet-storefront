'use client';

import { useEffect, useState } from 'react';
import { bootstrapSessionId, getSessionId } from '@/lib/session';

export function useSessionId(enabled = true): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    enabled ? (getSessionId() ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const existing = getSessionId();
    if (existing) {
      setSessionId(existing);
      return;
    }

    void bootstrapSessionId()
      .then((id) => setSessionId(id))
      .catch(() => undefined);
  }, [enabled]);

  return enabled ? sessionId : undefined;
}
