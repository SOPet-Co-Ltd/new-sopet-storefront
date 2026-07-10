'use client';

import { useEffect, useState } from 'react';
import { ensureSessionId, getSessionId } from '@/lib/session';

export function useSessionId(enabled = true): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    enabled ? (getSessionId() ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!enabled) {
      setSessionId(undefined);
      return;
    }

    setSessionId(getSessionId() ?? ensureSessionId());
  }, [enabled]);

  return sessionId;
}
