'use client';

import type { ComboboxOption } from '@/lib/hooks/useNavbarSearchCombobox';
import { SearchSuggestionRow } from '../SearchSuggestionsDropdown/SearchSuggestionRow';

type SearchSuggestionListboxProps = {
  listboxId: string;
  options: ComboboxOption[];
  activeIndex: number;
  onSelect: (option: ComboboxOption) => void;
};

export function SearchSuggestionListbox({
  listboxId,
  options,
  activeIndex,
  onSelect,
}: SearchSuggestionListboxProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <ul id={listboxId} role="listbox" className="py-1">
      {options.map((option, index) => (
        <SearchSuggestionRow
          key={option.id}
          id={`navbar-search-option-${index}`}
          label={option.label}
          imageUrl={option.thumbnailUrl}
          active={index === activeIndex}
          onSelect={() => onSelect(option)}
        />
      ))}
    </ul>
  );
}
