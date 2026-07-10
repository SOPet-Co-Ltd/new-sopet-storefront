'use client';

import { useEffect, useRef, useState } from 'react';

function getRemainingMs(expiresAt: string | null | undefined, nowMs: number): number | null {
  if (!expiresAt) {
    return null;
  }

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return null;
  }

  return Math.max(0, expiresMs - nowMs);
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function usePaymentCountdown(
  expiresAt: string | null | undefined,
  onExpire?: () => void,
): {
  remainingMs: number | null;
  isExpired: boolean;
} {
  const [remainingMs, setRemainingMs] = useState<number | null>(() =>
    getRemainingMs(expiresAt, Date.now()),
  );
  const hasNotifiedExpireRef = useRef(false);

  useEffect(() => {
    hasNotifiedExpireRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return;
    }

    const tick = () => {
      const nextRemainingMs = getRemainingMs(expiresAt, Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && !hasNotifiedExpireRef.current) {
        hasNotifiedExpireRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt, onExpire]);

  return {
    remainingMs,
    isExpired: remainingMs === 0,
  };
}
