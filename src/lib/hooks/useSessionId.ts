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

    let cancelled = false;

    void bootstrapSessionId()
      .then((id) => {
        if (!cancelled) {
          setSessionId(id);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return enabled ? sessionId : undefined;
}
