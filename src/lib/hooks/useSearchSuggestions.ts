'use client';

import { useQuery } from '@apollo/client/react';
import {
  SearchSuggestionsDocument,
  type SearchSuggestionsQuery,
} from '@/lib/graphql/generated/graphql';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useSessionId } from '@/lib/hooks/useSessionId';
import {
  MIN_SEARCH_QUERY_LENGTH,
  SEARCH_SUGGESTIONS_DEBOUNCE_MS,
  SEARCH_SUGGESTIONS_LIMIT,
} from '@/lib/search/constants';

export type SearchSuggestionProduct =
  SearchSuggestionsQuery['searchSuggestions']['products'][number];

export type SearchSuggestionQuery =
  SearchSuggestionsQuery['searchSuggestions']['queries'][number];

export function useSearchSuggestions(query: string, enabled = true) {
  const trimmed = query.trim();
  const canFetch = enabled && trimmed.length >= MIN_SEARCH_QUERY_LENGTH;
  const sessionId = useSessionId(canFetch);
  const debouncedQuery = useDebouncedValue(trimmed, SEARCH_SUGGESTIONS_DEBOUNCE_MS, canFetch);
  const isDebouncing = canFetch && trimmed !== debouncedQuery;
  const readyToFetch = canFetch && !isDebouncing && sessionId !== undefined;

  const { data, loading, error } = useQuery(SearchSuggestionsDocument, {
    variables: {
      query: debouncedQuery,
      limit: SEARCH_SUGGESTIONS_LIMIT,
      sessionId: sessionId ?? '',
    },
    skip: !readyToFetch,
    fetchPolicy: 'network-only',
  });

  return {
    products: readyToFetch ? (data?.searchSuggestions.products ?? []) : [],
    queries: readyToFetch ? (data?.searchSuggestions.queries ?? []) : [],
    loading: readyToFetch && loading,
    error: readyToFetch ? (error as Error | undefined) : undefined,
  };
}
