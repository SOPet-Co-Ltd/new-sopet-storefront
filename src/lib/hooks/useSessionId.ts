'use client';

import { useEffect, useState } from 'react';
import { ensureSessionId, getSessionId, hydrateSessionId } from '@/lib/session';

export function useSessionId(enabled = true): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    enabled ? (getSessionId() ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void hydrateSessionId()
      .then((id) => {
        if (!cancelled) setSessionId(id);
      })
      .catch(() => {
        if (!cancelled) setSessionId(getSessionId() ?? ensureSessionId());
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return enabled ? sessionId : undefined;
}
