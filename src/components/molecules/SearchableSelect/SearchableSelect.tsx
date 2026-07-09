'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { DownArrowIcon } from '@/components/atoms/icons';
import { normalizeSearch } from '@/lib/thai-address';
import { cn } from '@/lib/utils';
import { getOptionSearchText, type SearchableOption } from './types';

function getSearchDisplayFromValue(
  value: string,
  options: SearchableOption[],
  getDisplayLabel?: (value: string, options: SearchableOption[]) => string,
): string {
  if (!value) return '';

  const selected = options.find((item) => item.value === value || item.label === value);
  if (selected) return selected.label;

  if (getDisplayLabel) return getDisplayLabel(value, options);

  return value;
}

export type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  title?: string;
  placeholder: string;
  disabled?: boolean;
  error?: { message?: string };
  onSelect?: (option: SearchableOption) => void;
  isRequired?: boolean;
  getDisplayLabel?: (value: string, options: SearchableOption[]) => string;
  emptyText?: string;
  className?: string;
  hideTitle?: boolean;
  storeFieldValue?: 'value' | 'label';
  searchable?: boolean;
  showAllOptions?: boolean;
  variant?: 'flat' | 'bordered' | 'underlined';
  'data-testid'?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  title,
  placeholder,
  disabled,
  error,
  onSelect,
  isRequired = true,
  getDisplayLabel,
  emptyText = 'ไม่พบข้อมูล',
  className,
  hideTitle = false,
  storeFieldValue = 'value',
  searchable = true,
  showAllOptions = false,
  variant = 'flat',
  'data-testid': dataTestId,
}: SearchableSelectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(() =>
    getSearchDisplayFromValue(value, options, getDisplayLabel),
  );
  const [filterBySearch, setFilterBySearch] = useState(false);

  const closePanel = useCallback(() => {
    setOpen(false);
    if (showAllOptions) setFilterBySearch(false);
  }, [showAllOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closePanel]);

  const displayValue =
    searchable && open
      ? search
      : getSearchDisplayFromValue(value, options, getDisplayLabel);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;

    const query = normalizeSearch(search);

    if (showAllOptions && (!filterBySearch || !query)) return options;
    if (!query) return options;

    return options.filter((item) => getOptionSearchText(item).includes(query));
  }, [options, search, searchable, showAllOptions, filterBySearch]);

  const optionKey = (option: SearchableOption, index: number) =>
    `${option.value}-${String(option.postalCode ?? '')}-${index}`;

  return (
    <div ref={ref} className={cn('relative', className)} data-testid={dataTestId}>
      <Input
        isRequired={isRequired}
        hasTitle={!hideTitle}
        title={title}
        placeholder={placeholder}
        value={displayValue}
        autoComplete="off"
        disabled={disabled}
        readOnly={!searchable}
        variant={variant}
        state={error?.message ? 'error' : 'default'}
        description={error?.message}
        className={!searchable ? 'cursor-pointer' : undefined}
        onChange={(event) => {
          if (!searchable) return;
          setSearch(event.target.value);
          onChange('');
          setOpen(true);
          if (showAllOptions) setFilterBySearch(true);
        }}
        onClick={() => {
          if (!searchable && !disabled) {
            setOpen((prev) => !prev);
          }
        }}
        onFocus={() => {
          setOpen(true);
          if (showAllOptions) setFilterBySearch(false);
        }}
        endIcon={<DownArrowIcon size={{ mobile: 12, desktop: 12 }} color="#211F23" />}
        aria-required={isRequired}
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-sop-8px border border-sop-neutral-grayalpha-300 bg-sop-base-white shadow-lg">
          <div className="max-h-35 w-full min-w-0 overflow-x-hidden overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="sop-body-sm-regular px-4 py-3 text-sop-neutral-gray-300">{emptyText}</p>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={optionKey(option, index)}
                  type="button"
                  className="box-border flex w-full min-w-0 max-w-full px-4 py-3 text-left hover:bg-sop-neutral-gray-500"
                  onClick={() => {
                    onChange(storeFieldValue === 'label' ? option.label : option.value);
                    setSearch(option.label);
                    onSelect?.(option);
                    closePanel();
                  }}
                >
                  <span className="block min-w-0 w-full truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
