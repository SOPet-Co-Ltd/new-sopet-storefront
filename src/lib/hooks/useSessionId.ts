'use client';

import { useEffect, useState } from 'react';
import { ensureSessionId, getSessionId } from '@/lib/session';

export function useSessionId(enabled = true): string | undefined {
  const [sessionId, setSessionId] = useState<string | undefined>(() =>
    enabled ? (getSessionId() ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!enabled) return;
    // ensureSessionId writes a fresh cookie as a side effect when none exists yet;
    // this must run once on mount rather than during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(getSessionId() ?? ensureSessionId());
  }, [enabled]);

  // Disabled reads bypass the stored sessionId entirely, so nothing needs to be
  // synced to undefined here.
  return enabled ? sessionId : undefined;
}
