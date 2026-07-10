'use client';

import { useCallback, useState } from 'react';
import { RECENT_SEARCHES_STORAGE_KEY } from '@/lib/session';

const MAX_RECENT_SEARCHES = 12;

function readRecentSearches(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

function writeRecentSearches(entries: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(entries));
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches());

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setRecentSearches((current) => {
      const deduped = [trimmed, ...current.filter((entry) => entry !== trimmed)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      writeRecentSearches(deduped);
      return deduped;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    writeRecentSearches([]);
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
