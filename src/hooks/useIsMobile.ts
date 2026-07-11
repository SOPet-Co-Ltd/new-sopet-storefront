'use client';

import { useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

const getSnapshot = (breakpoint: number): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
};

const subscribe = (breakpoint: number, callback: () => void): (() => void) => {
  const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

export const useIsMobile = (breakpoint: number = 768) => {
  return useSyncExternalStore(
    (callback) => subscribe(breakpoint, callback),
    () => getSnapshot(breakpoint),
    getServerSnapshot,
  );
};
