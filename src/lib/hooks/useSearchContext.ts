'use client';

import { useMemo } from 'react';
import type { SearchContextInput } from '@/lib/graphql/generated/graphql';
import { useRecentSearches } from '@/lib/hooks/useRecentSearches';
import { UUID_V4_REGEX } from '@/lib/session';

const MAX_RECENT_QUERIES = 10;
const MAX_QUERY_LENGTH = 200;
const MAX_RECENT_PRODUCT_IDS = 20;

function truncateRecentQueries(queries: string[]): string[] {
  return queries
    .map((query) => query.trim().slice(0, MAX_QUERY_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_RECENT_QUERIES);
}

function truncateRecentProductIds(productIds: string[]): string[] {
  return productIds.filter((id) => UUID_V4_REGEX.test(id)).slice(0, MAX_RECENT_PRODUCT_IDS);
}

export function buildSearchContextInput({
  recentQueries,
  recentProductIds = [],
}: {
  recentQueries: string[];
  recentProductIds?: string[];
}): SearchContextInput | undefined {
  const normalizedQueries = truncateRecentQueries(recentQueries);
  const normalizedProductIds = truncateRecentProductIds(recentProductIds);

  if (normalizedQueries.length === 0 && normalizedProductIds.length === 0) {
    return undefined;
  }

  return {
    recentQueries: normalizedQueries.length > 0 ? normalizedQueries : undefined,
    recentProductIds: normalizedProductIds.length > 0 ? normalizedProductIds : undefined,
  };
}

export function useSearchContext(): SearchContextInput | undefined {
  const { recentSearches } = useRecentSearches();

  return useMemo(
    () =>
      buildSearchContextInput({
        recentQueries: recentSearches,
        recentProductIds: [],
      }),
    [recentSearches],
  );
}
