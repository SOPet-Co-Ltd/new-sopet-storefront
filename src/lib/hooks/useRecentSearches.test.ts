import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { RECENT_SEARCHES_STORAGE_KEY } from '@/lib/session';
import { useRecentSearches } from '@/lib/hooks/useRecentSearches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('stores deduped MRU entries under sopet_recent_searches with max 12 items', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let index = 0; index < 14; index += 1) {
        result.current.addRecentSearch(`query-${index}`);
      }
      result.current.addRecentSearch('query-5');
    });

    expect(result.current.recentSearches[0]).toBe('query-5');
    expect(result.current.recentSearches).toHaveLength(12);
    expect(JSON.parse(window.sessionStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) ?? '[]')).toHaveLength(
      12,
    );
  });

  it('clears recent searches from sessionStorage', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('cat food');
    });

    act(() => {
      result.current.clearRecentSearches();
    });

    expect(result.current.recentSearches).toEqual([]);
    expect(window.sessionStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toBe('[]');
  });
});
