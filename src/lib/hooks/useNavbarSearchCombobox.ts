'use client';

import { useCallback, useMemo, useState } from 'react';
import { MIN_SEARCH_QUERY_LENGTH } from '@/lib/search/constants';

export type ComboboxOption = {
  type: 'product';
  id: string;
  label: string;
  href: string;
  thumbnailUrl?: string | null;
};

type UseNavbarSearchComboboxParams = {
  query: string;
  isOpen: boolean;
  productOptions: ComboboxOption[];
  onSelect: (option: ComboboxOption) => void;
  onClose: () => void;
};

export function useNavbarSearchCombobox({
  query,
  isOpen,
  productOptions,
  onSelect,
  onClose,
}: UseNavbarSearchComboboxParams) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const options = useMemo(() => {
    if (query.trim().length < MIN_SEARCH_QUERY_LENGTH) {
      return [];
    }

    return productOptions;
  }, [query, productOptions]);

  const resetActiveIndex = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || options.length === 0) {
        if (event.key === 'Escape') {
          onClose();
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => (current + 1 >= options.length ? 0 : current + 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => (current <= 0 ? options.length - 1 : current - 1));
        return;
      }

      if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        onSelect(options[activeIndex]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [activeIndex, isOpen, onClose, onSelect, options],
  );

  const activeOptionId =
    activeIndex >= 0 && options[activeIndex] ? `navbar-search-option-${activeIndex}` : undefined;

  return {
    options,
    activeIndex,
    activeOptionId,
    handleKeyDown,
    resetActiveIndex,
  };
}
