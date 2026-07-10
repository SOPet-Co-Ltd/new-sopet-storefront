'use client';

import { useQuery } from '@apollo/client/react';
import {
  SearchRecoverySuggestionsDocument,
  type SearchRecoverySuggestionsQuery,
  type SearchRecoverySuggestionsQueryVariables,
} from '@/lib/graphql/generated/graphql';

export function useSearchRecoverySuggestions(query: string, enabled = true) {
  const trimmed = query.trim();
  const shouldSkip = !enabled || trimmed.length === 0;

  const { data, loading, error } = useQuery<
    SearchRecoverySuggestionsQuery,
    SearchRecoverySuggestionsQueryVariables
  >(SearchRecoverySuggestionsDocument, {
    variables: { query: trimmed },
    skip: shouldSkip,
    fetchPolicy: 'cache-first',
  });

  return {
    suggestions: data?.searchRecoverySuggestions ?? [],
    loading: !shouldSkip && loading,
    error: error as Error | undefined,
  };
}
