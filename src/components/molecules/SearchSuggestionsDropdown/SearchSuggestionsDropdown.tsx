'use client';

import type { ComboboxOption } from '@/lib/hooks/useNavbarSearchCombobox';
import { MIN_SEARCH_QUERY_LENGTH } from '@/lib/search/constants';
import { SearchRecentSection } from './SearchRecentSection';
import { SearchSuggestionListbox } from '../SearchSuggestionListbox/SearchSuggestionListbox';

type SearchSuggestionsDropdownProps = {
  open: boolean;
  query: string;
  listboxId: string;
  recentQueries: string[];
  options: ComboboxOption[];
  activeIndex: number;
  loading: boolean;
  error?: Error;
  onSelect: (option: ComboboxOption) => void;
  onRecentSelect: (query: string) => void;
  onClearRecent: () => void;
};

export function SearchSuggestionsDropdown({
  open,
  query,
  listboxId,
  recentQueries,
  options,
  activeIndex,
  loading,
  error,
  onSelect,
  onRecentSelect,
  onClearRecent,
}: SearchSuggestionsDropdownProps) {
  if (!open) {
    return null;
  }

  const trimmedQuery = query.trim();
  const showRecent = trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH && recentQueries.length > 0;
  const showProducts = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;

  if (!showRecent && !showProducts) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-sop-neutral-gray-400 bg-white shadow-lg"
      data-testid="search-suggestions-dropdown"
    >
      {showRecent ? (
        <SearchRecentSection items={recentQueries} onSelect={onRecentSelect} onClear={onClearRecent} />
      ) : null}

      {showProducts && loading ? (
        <p className="px-3 py-3 sop-body-sm-regular text-sop-neutral-gray-300" role="status" aria-live="polite">
          กำลังโหลดคำแนะนำ
        </p>
      ) : null}

      {showProducts && error ? (
        <p className="px-3 py-3 sop-body-sm-regular text-red-600">โหลดคำแนะนำไม่สำเร็จ</p>
      ) : null}

      {showProducts && !loading && !error && options.length === 0 ? (
        <p className="px-3 py-3 sop-body-sm-regular text-sop-neutral-gray-300">ไม่พบคำแนะนำ</p>
      ) : null}

      {showProducts && !loading && !error && options.length > 0 ? (
        <SearchSuggestionListbox
          listboxId={listboxId}
          options={options}
          activeIndex={activeIndex}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}
