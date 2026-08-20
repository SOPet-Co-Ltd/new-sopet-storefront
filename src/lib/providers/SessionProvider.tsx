'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { bootstrapSessionId, getSessionId } from '@/lib/session';

const SessionContext = createContext(false);

export function useGuestSessionReady(): boolean {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => getSessionId() !== null);

  useEffect(() => {
    if (ready) {
      return;
    }

    void bootstrapSessionId()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, [ready]);

  return <SessionContext.Provider value={ready}>{children}</SessionContext.Provider>;
}
