'use client';

import { useEffect, useState } from 'react';

import { preloadThaiAddressDataset } from './helpers';

export function useThaiAddressDataset(): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void preloadThaiAddressDataset().then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready };
}
