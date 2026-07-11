'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SearchSuggestionsDropdown } from '@/components/molecules/SearchSuggestionsDropdown/SearchSuggestionsDropdown';
import { useNavbarSearchCombobox, type ComboboxOption } from '@/lib/hooks/useNavbarSearchCombobox';
import { useRecentSearches } from '@/lib/hooks/useRecentSearches';
import { useSearchSuggestions } from '@/lib/hooks/useSearchSuggestions';
import { MIN_SEARCH_QUERY_LENGTH } from '@/lib/search/constants';
import { cn } from '@/lib/utils';

import { SearchIcon } from '../atoms/icons';

const SEARCH_LABEL = 'ค้นหาสินค้า';
const SEARCH_PARAM = 'q';
const SEARCH_INPUT_ID = 'navbar-search-input';
const BLUR_CLOSE_DELAY_MS = 150;

function shouldOpenSuggestions(trimmedLength: number): boolean {
  return trimmedLength === 0 || trimmedLength >= MIN_SEARCH_QUERY_LENGTH;
}

function toProductOptions(
  products: ReturnType<typeof useSearchSuggestions>['products'],
): ComboboxOption[] {
  return products.map((product) => ({
    type: 'product',
    id: product.id,
    label: product.name,
    href: `/product/${product.id}`,
    thumbnailUrl: product.thumbnailUrl,
  }));
}

export function NavbarSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const trimmedLength = query.trim().length;
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const { products, loading, error } = useSearchSuggestions(
    query,
    isOpen && trimmedLength >= MIN_SEARCH_QUERY_LENGTH,
  );

  const productOptions = useMemo(() => toProductOptions(products), [products]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateToSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }

      addRecentSearch(trimmed);
      closeDropdown();
      setQuery(trimmed);
      router.push(`/search?${SEARCH_PARAM}=${encodeURIComponent(trimmed)}`);
    },
    [addRecentSearch, closeDropdown, router],
  );

  const handleSelect = useCallback(
    (option: ComboboxOption) => {
      if (trimmedLength > 0) {
        addRecentSearch(query.trim());
      }
      closeDropdown();
      router.push(option.href);
    },
    [addRecentSearch, closeDropdown, query, router, trimmedLength],
  );

  const { options, activeIndex, activeOptionId, handleKeyDown, resetActiveIndex } =
    useNavbarSearchCombobox({
      query,
      isOpen,
      productOptions,
      onSelect: handleSelect,
      onClose: closeDropdown,
    });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && activeIndex < 0) {
      event.preventDefault();
      navigateToSearch(query);
      return;
    }

    handleKeyDown(event);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative flex min-w-0 flex-1 items-center"
    >
      <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
        {SEARCH_LABEL}
      </label>
      <div
        className={cn(
          'sop-body-sm-regular flex h-9 w-full min-w-[200px] max-w-[480px] items-center gap-2 rounded-full',
          'bg-sop-neutral-gray-500 px-3 md:px-4',
          'focus-within:ring-2 focus-within:ring-sop-primary-400 focus-within:ring-offset-1',
        )}
      >
        <SearchIcon size={{ mobile: 16, desktop: 18 }} color="#454547" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          id={SEARCH_INPUT_ID}
          name={SEARCH_PARAM}
          value={query}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            resetActiveIndex();
            setIsOpen(shouldOpenSuggestions(nextQuery.trim().length));
          }}
          onFocus={() => {
            if (shouldOpenSuggestions(trimmedLength)) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(closeDropdown, BLUR_CLOSE_DELAY_MS);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={SEARCH_LABEL}
          autoComplete="off"
          enterKeyHint="search"
          aria-label={SEARCH_LABEL}
          className={cn(
            'sop-body-sm-regular min-w-0 flex-1 appearance-none border-0 bg-transparent outline-none',
            'px-1 py-1',
            'text-sop-neutral-gray-100 placeholder:text-sop-neutral-gray-400',
          )}
        />
      </div>
      <SearchSuggestionsDropdown
        open={isOpen}
        query={query}
        listboxId={listboxId}
        recentQueries={recentSearches}
        options={options}
        activeIndex={activeIndex}
        loading={loading}
        error={error}
        onSelect={handleSelect}
        onRecentSelect={navigateToSearch}
        onClearRecent={clearRecentSearches}
      />
      <button type="submit" className="sr-only">
        ค้นหา
      </button>
    </form>
  );
}
