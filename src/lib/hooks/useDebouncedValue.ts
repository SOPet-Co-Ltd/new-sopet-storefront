'use client';

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number, enabled = true): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (!enabled) {
      // Disabled reads bypass debouncedValue entirely (see return below), so there
      // is nothing to sync here until a debounce cycle starts again.
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, enabled, value]);

  return enabled ? debouncedValue : value;
}
